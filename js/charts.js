var nodes;
var links;
var margin = 10;
var tip_shift = ({top:20, right: 20});
var OPACITY_SUM = 1 + 0.2;
var svg_hw = {height: 700, width : 700};
var CIRCLE_R = 4;
var STROKE_WIDTH = 1;
var NODE_OPACITY = 0.5;
var LINE_OPACITY = 0.2;
var svg;
// console.log("start")
function data2list(data){
    // console.log(data);
    // console.log(data['links']);
    // console.log(data['nodes']);
    links = [];
    nodes = [];


    for (var i = 0; i < data['links'].length; i++) {
        links.push({'id':i,'source':data['links'][i]['source'],'target':data['links'][i]['target']});
    }

    for (var i = 0; i < data['nodes'].length; i++) {
        node_x = Math.random() * svg_hw.width;
        node_y = Math.random() * svg_hw.height;
        var toLinks = [];
        var toNodes = [];
        for (var j = 0; j < links.length; j++) {
            if (links[j]['source'] == data['nodes'][i]['id'] || links[j]['target'] == data['nodes'][i]['id']) {
                toLinks.push(j);
                if (toNodes.indexOf(parseInt(links[j]['source'])) == -1) {
                    toNodes.push(parseInt(links[j]['source']));
                }
                if (toNodes.indexOf(parseInt(links[j]['target'])) == -1) {
                    toNodes.push(parseInt(links[j]['target']));
                }
            }
        }
        nodes.push({'id':data['nodes'][i]['id'],'name':data['nodes'][i]['name'],'toNodes':toNodes,'toLinks':toLinks,'x':node_x,'y':node_y,'vx':0,'vy':0,'Fx':0,'Fy':0,'fixed':0})
    }
    // console.log(nodes);
    // console.log(links);
}

function draw(){
    svg.selectAll("circle")
        .data(nodes)
        .transition()
        .attr("cx",d => d.x)
        .attr("cy",d => d.y);

    svg.selectAll("line")
        .data(links)
        .transition()
        .attr("x1",d => nodes[parseInt(d['source'])].x)
        .attr("y1",d => nodes[parseInt(d['source'])].y)
        .attr("x2",d => nodes[parseInt(d['target'])].x)
        .attr("y2",d => nodes[parseInt(d['target'])].y);

}
function mouseover(){


    svg.selectAll("circle")
        .on("mouseover", function (data) {
            // console.log(svg.selectAll("circle")._groups[0]);
            // console.log(data);
            svg.selectAll("circle")
                .transition()
                .attr("opacity",function(dd){
                    // console.log(dd);
                    if (data.toNodes.indexOf(parseInt(dd.id)) != -1) {
                        return 1;
                    }
                    else{
                        return NODE_OPACITY * 0.5;
                    }
                })

            svg.selectAll("line")
                .transition()
                .attr("opacity",function(dd){
                    if (data.toLinks.indexOf(parseInt(dd.id)) != -1) {
                        return 1;
                    }
                    else{
                        return LINE_OPACITY * 0.5;
                    }
                })

            })
        .on("mouseout", function () {
            svg.selectAll("circle")
                .transition()
                .attr("opacity",NODE_OPACITY)
            svg.selectAll("line")
                .transition()
                .attr("opacity",LINE_OPACITY);
            // for (var i = 0; i < nodes.length; i++) {
            //     nodes[i].opacity = NODE_OPACITY;
            // }
            // draw();
            // svg_tooltip.style('display', "none")
        })

}

function init(){
    svg = d3.select("#svg1")
        .append("svg")
        .attr("viewBox", [0, 0, svg_hw.width, svg_hw.height]);


    svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class","node")
        .attr("cx",d => d.x)
        .attr("cy",d => d.y)
        .attr("r", CIRCLE_R)
        .attr("fill","black")
        .attr("opacity",NODE_OPACITY)



    svg.selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("class","link")
            .attr("x1",d => nodes[parseInt(d['source'])].x)
            .attr("y1",d => nodes[parseInt(d['source'])].y)
            .attr("x2",d => nodes[parseInt(d['target'])].x)
            .attr("y2",d => nodes[parseInt(d['target'])].y)
            .attr("stroke","gray")
            // .attr("stroke-width",STROKE_WIDTH)
            .attr("opacity",LINE_OPACITY)
}

function dis(node1,node2){
    //计算距离
    var dx = node1.x - node2.x;
    var dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy);
}
//https://segmentfault.com/a/1190000016384506?utm_source=tag-newest
function Fk(node1,node2,k = 0.1,min=0){
    //弹簧 F = k*dx
    //仅在有边时进行计算,计算引力
    //对node1的力
    var dnode = dis(node1, node2);
    if (dnode <= min) {
        return [0,0];
    }

    var F = (dnode-min) * (dnode-min) * k;
    var Fx = -F / dnode * (node1.x - node2.x);
    var Fy = -F / dnode * (node1.y - node2.y);
    // return [0,0];
    return [Fx,Fy]
}

function Fe(node1, node2,k = 10){
    //库仑斥力F = k / (x*x)
    //计算斥力
    //对node1的力
    var dnode = dis(node1, node2);
    var F = k / (dnode);
    // alert(F);
    var Fx = F / dnode * (node1.x - node2.x);
    var Fy = F / dnode * (node1.y - node2.y);

    return [Fx,Fy];
    // return [0,0];
}
function Fborder(node, k = 0.1){
    var Fx = 0,Fy = 0;
    // var Fx = (k / (0.001 + (0 - node.x) * (0 - node.x))) - (k / (0.001 + (node.x - svg_hw.width) * (node.x - svg_hw.width)));
    // var Fy = (k / (0.001 + (0 - node.y) * (0 - node.y))) - (k / (0.001 + (node.y - svg_hw.height) * (node.y - svg_hw.height)));
    

    if (node.x < margin)
        Fx = k/0.001;
    else if(node.x > svg_hw.width-margin)
        Fx = -k/0.001;
    else
        Fx = (k / (0.001 + (margin - node.x) * (margin - node.x))) - (k / (0.001 + (node.x - svg_hw.width + margin) * (node.x - svg_hw.width + margin)));

    if (node.y < margin)
        Fy = k/0.001;
    else if(node.y > svg_hw.height-margin)
        Fy = -k/0.001;
    else
        Fy = (k / (0.001 + (margin - node.y) * (margin - node.y))) - (k / (0.001 + (node.y - svg_hw.height + margin) * (node.y - svg_hw.height + margin)));

    return [Fx,Fy];
    

}
function move2center(){
    var sum_x = 0;
    var sum_y = 0;
    for (var i = 0; i < nodes.length; i++) {
        sum_x += nodes[i].x;
        sum_y += nodes[i].y;
    }
    var svg_center_x = svg_hw.width / 2;
    var svg_center_y = svg_hw.height / 2;

    var dx = svg_center_x - (sum_x / nodes.length);
    var dy = svg_center_y - (sum_y / nodes.length);

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].fixed == 1) {
            continue;
        }
        nodes[i].x += dx;
        nodes[i].y += dy;
    }
    
}

function train(Fk_k = 0.0001,Fe_k = 10,decay = 0.5,max_step = 400,draw_step = 10,dt = 1,max_dx = 10,min_gap = 2){
    var step = 0;
    function loop(){
        

        step += 1;
        // console.log(step);
        if (step > max_step) {return;}
        for (var i = 0; i < nodes.length; i++) {
            var tmp_Fb = Fborder(nodes[i]);
            nodes[i].Fx = tmp_Fb[0];
            nodes[i].Fy = tmp_Fb[1];
        }

        for (var i = 0; i < nodes.length; i++) {
            var max_Fe = 0;
            for (var j = i + 1; j < nodes.length; j++) {
                var tmp_Fe = Fe(nodes[i],nodes[j],Fe_k);
                nodes[i].Fx += tmp_Fe[0];
                nodes[i].Fy += tmp_Fe[1];
                nodes[j].Fx -= tmp_Fe[0];
                nodes[j].Fy -= tmp_Fe[1];
                max_Fe = Math.max(tmp_Fe[0],max_Fe);
                max_Fe = Math.max(tmp_Fe[1],max_Fe);

                // console.log(tmp_F);
            }
            // console.log(max_Fe);
            var max_Fk = 0;
            for (var j = 0; j < nodes[i].toNodes.length; j++) {
                var tmp_Fk = Fk(nodes[i],nodes[nodes[i].toNodes[j]],Fk_k);
                max_Fk = Math.max(tmp_Fk[0],max_Fk);
                max_Fk = Math.max(tmp_Fk[1],max_Fk);

                nodes[i].Fx += tmp_Fk[0];
                nodes[i].Fy += tmp_Fk[1];
            }
            // console.log("k",max_Fk);
        }
        // for (var i = 0; i < links.length; i++) {
        //     var node1_id = parseInt(links[i].source);
        //     var node2_id = parseInt(links[i].target);
        //     var tmp_F = Fe(nodes[node1_id],nodes[node2_id]);
        //     nodes[node1_id].Fx += tmp_F[0];
        //     nodes[node1_id].Fy += tmp_F[1];
        //     nodes[node2_id].Fx -= tmp_F[0];
        //     nodes[node2_id].Fy -= tmp_F[1];
        // }
        var max_d = 0;
        var max_F = 0;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].fixed == 1) {
                nodes[i].vx = 0;
                nodes[i].vy = 0;
                nodes[i].Fx = 0;
                nodes[i].Fy = 0;
                continue;
            }

            max_F = Math.max(Math.abs(max_F),Math.abs(nodes[i].Fx),Math.abs(nodes[i].Fy));
            // console.log(nodes[i].Fx);
            // console.log(nodes[i].Fy);
            nodes[i].vx *= decay;
            nodes[i].vy *= decay;
            nodes[i].vx += nodes[i].Fx * dt;
            nodes[i].vy += nodes[i].Fy * dt;

            var change_x = nodes[i].vx * dt;
            var change_y = nodes[i].vy * dt;
            
            max_d = Math.max(Math.abs(max_d),Math.abs(change_x));
            max_d = Math.max(Math.abs(max_d),Math.abs(change_y));

            if (change_x < 0) {
                change_x = Math.max(change_x, -max_dx);
            }
            else{
                change_x = Math.min(change_x, max_dx);
            }
            if (change_y < 0) {
                change_y = Math.max(change_y, -max_dx);
            }
            else{
                change_y = Math.min(change_y, max_dx);
            }
            nodes[i].x += change_x;
            nodes[i].y += change_y;
            
        }
        // console.log(max_d);
        // console.log(max_F);
        if (max_F < min_gap) {
            draw();
            return;
        }
        // console.log(nodes[0].x,nodes[0].y,nodes[0].Fx,nodes[0].Fy,nodes[0].vx,nodes[0].vy);
        // console.log(max_d);
        if (step % draw_step == 0) {
            move2center();
            draw();
        }

        setTimeout(() => {
            loop();
        }, 0);
    }
    setTimeout(() => {
        loop();
        draw();
    }, 0);
}

function addDrag(){
    function dragMove(d) {
        // console.log(d);
        // console.log(this);
        d3.select(this)
            .attr("cx", function(d){
                d.x = d3.event.x;
                return d.x;
            })
            .attr("cy", function(d){
                d.y = d3.event.y;
                return d.y;
            });
        svg.selectAll("line")
            .attr("x1", d => nodes[d['source']].x)
            .attr("y1", d => nodes[d['source']].y)
            .attr("x2", d => nodes[d['target']].x)
            .attr("y2", d => nodes[d['target']].y);
        d.fixed = 1;
        draw();
        train();
    }
    function dragEnd(d) {
        d3.select(this)
            .attr("cx", function(d){
                d.x = d3.event.x;
                return d.x;
            })
            .attr("cy", function(d){
                d.y = d3.event.y;
                return d.y;
            });
        svg.selectAll("line")
            .attr("x1", d => nodes[d['source']].x)
            .attr("y1", d => nodes[d['source']].y)
            .attr("x2", d => nodes[d['target']].x)
            .attr("y2", d => nodes[d['target']].y);
        d.fixed = 0;
        draw();
        train();
    }
    let drag = d3.drag()
        .subject(function() {
            let t = d3.select(this);
            return {
                x: t.attr("cx"),
                y: t.attr("cy")
            };
        })
        .on("drag", dragMove)
        .on("end", dragEnd);

    svg.selectAll("circle").call(drag);
}

d3.json('data/add_matrix_change_jazz.json').then(function(data)
{   

    data2list(data);
    init();
    addDrag();
    train();
    mouseover();

})

