var nodes;
var links;
var margin = ({top: 10, right: 10, bottom: 20, left: 40});
var tip_shift = ({top:20, right: 20});
var OPACITY_SUM = 1 + 0.2;
var svg_hw = {height: 1200, width : 1200};
var CIRCLE_R = 7;
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
        nodes.push({'id':data['nodes'][i]['id'],'name':data['nodes'][i]['name'],'toNodes':toNodes,'toLinks':toLinks,'x':node_x,'y':node_y})
    }
    console.log(nodes);
    console.log(links);
}

function draw(){
    svg.selectAll("circle")



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

//https://segmentfault.com/a/1190000016384506?utm_source=tag-newest
function F1(node1,node2){


}



d3.json('data/jazz.json').then(function(data)
{   

    data2list(data);
    init();
    // draw();

})

