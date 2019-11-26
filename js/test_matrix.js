function draw_matrix()
{

  var choose_id = [];
  var choose_nodes = new Set();
  var choose_bool = false;
  var svg;
  var margin = {top: 20, right: 0, bottom: 0, left: 0},
      width = 700,
      height = 700;
  var font_size = '5px'
  var x,z,c;
  var index_change_dict;
  var fill_opacity = 0.5;

  var svg = d3.select("#svg2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", -margin.left + "px")


  var matrix_svg = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data/add_matrix_change_jazz.json").then( function(miserables) {
    // console.log(miserables['nodes'])
    index_change_dict = miserables.index_change_dict;
    // console.log(index_change_dict);
    nodes_ids = [];
    for (var i = 0; i < miserables['nodes'].length; i++) {
      nodes_ids.push(parseInt(miserables['nodes'][i].id));
    }
    x = d3.scaleBand().domain(nodes_ids).range([0, width]);
    // console.log(x.bandwidth())
    // z = d3.scaleLinear().domain([0, 4]).clamp(true);
      // c = d3.scaleCategory10().domain(d3.range(10));
    // c = d3.scaleOrdinal().domain(d3.range(10));




    // console.log(miserables);
    var matrix = [],
        nodes = miserables.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
      node.index = i;
      node.count = 0;
      matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    // Convert links to matrix; count character occurrences.
    miserables.links.forEach(function(link) {
      // matrix[link.source][link.target].z += link.value;
      // matrix[link.target][link.source].z += link.value;
      // matrix[link.source][link.source].z += link.value;
      // matrix[link.target][link.target].z += link.value;
      // nodes[link.source].count += link.value;
      // nodes[link.target].count += link.value;

      matrix[link.source][link.target].z += 1;
      matrix[link.target][link.source].z += 1;
      // matrix[link.source][link.source].z += 1;
      // matrix[link.target][link.target].z += 1;
      nodes[link.source].count += 1;
      nodes[link.target].count += 1;
    });
    for (var i = 0; i < matrix.length; i++) {
      matrix[i][i].z = 1;
    }

    // console.log(matrix);

    // Precompute the orders.
    var orders = {
      name: d3.range(n).sort(function(a, b) { return nodes[a].id - nodes[b].id;}),//d3.ascending(nodes[a].name, nodes[b].name);
      count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count;}),
      group: d3.range(n).sort(function(a, b) { return index_change_dict[parseInt(nodes[a].id)] - index_change_dict[parseInt(nodes[b].id)];})
      // group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
    };

    // The default sort order.
    x.domain(orders.name);

    // matrix_svg.append("rect")
    //     .attr("class", "background")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("fill",'white');

    var row = matrix_svg.selectAll(".row")
        .data(matrix)
      .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .each(row_f);

    // row.append("line")
        // .attr("x2", width);

    // row.append("text")
    //     .attr("x", -6)
    //     .attr("y", x.bandwidth() / 2)
    //     .attr("dy", ".16em")
    //     .attr("text-anchor", "end")
    //     .attr("font-size", font_size)
    //     .text(function(d, i) { return nodes[i].name; });

    var column = matrix_svg.selectAll(".column")
        .data(matrix)
      .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    // column.append("line")
        // .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .attr("font-size", font_size)
        .text(function(d, i) { return nodes[i].name; });


    // d3.selectAll("text").classed("active", false);
    function row_f(row) {
      // console.log(row);
      var cell = d3.select(this).selectAll(".cell")
          .data(row.filter(function(d) { return d.z; }))
        .enter().append("rect")
          .attr("class", "cell")
          .attr("x", function(d) { return x(d.x); })
          .attr("width", x.bandwidth())
          .attr("height", x.bandwidth())
          .attr("fill-opacity", function(d) {return fill_opacity;})
          .attr("fill", function(d) {
            // console.log(d);
            if (d.x == d.y) {
              return "white";
            }
            else{
              return "black";
            }
          })
          .on("click",function(d,i){
            
            choose_bool = !choose_bool;
            // console.log("new_click",choose_bool);
            // console.log(d3.mouse(this));
            // console.log(this);
            // console.log(d);
            // console.log(x(d.x));
            if (choose_bool) {

              choose_nodes = new Set();
              choose_id = [];
              choose_id.push(d.x);
              matrix_svg.selectAll(".cell")
                .transition()
                .attr("fill",function(dd){
                  if (dd.x == d.x && dd.x != dd.y) {
                    // console.log(dd.x);
                    choose_nodes.add(dd.x);
                    return "red";

                  }
                  if (dd.y == d.y && dd.x != dd.y) {
                    // console.log(dd.x);
                    choose_nodes.add(dd.x);
                    return "red";

                  }
                  else{
                    if (dd.x == dd.y) {
                      return "white";
                    }
                    else
                      return "black";
                  }
                })
            }
            else{
              if (choose_id[0] == d.x) {
                choose_nodes = new Set();
                // console.log(d.x);
                matrix_svg.selectAll(".cell")
                  .transition()
                  .attr("fill",function(dd){
                    // return "black";
                    if (dd.x == dd.y) {
                      return "white";
                    }
                    else{
                      return "black";
                    }
                  });
              }
              else{
                choose_id.push(d.x);
                left_x = Math.min(x(choose_id[0]),x(choose_id[1]));
                right_x = Math.max(x(choose_id[0]),x(choose_id[1]));
                matrix_svg.selectAll(".cell")
                  .transition()
                  .attr("fill",function(dd){
                     if (x(dd.x) >= left_x && x(dd.x) <= right_x && dd.x != dd.y && x(dd.y) >= left_x && x(dd.y) <= right_x) {
                      choose_nodes.add(dd.x);
                      return "red";
                     }
                     else{
                      if (dd.x == dd.y) {
                        return "white";
                      }
                      else
                        return "black";
                    }
                  })
              }
            
            }
            console.log(choose_nodes);
            d3.select("#svg1").selectAll("circle")
              .transition()
              .attr("fill",function(dd){
                // console.log(dd);
                if (choose_nodes.has(parseInt(dd.name))) {
                  return "red";
                }
                else{
                  return "black";
                }
              })
            d3.select("#svg1").selectAll("line")
              .transition()
              .attr("stroke",function(dd){
                // console.log(d);
                if (choose_nodes.has(parseInt(dd.source)) && choose_nodes.has(parseInt(dd.target))) {
                  return 'rgb(254,156,21)';
                }
                // else if(choose_nodes.has(parseInt(dd.target))){
                //   return 'rgb(254,156,21)';

                // }
                else{
                  return 'grey';
                }
                
              })

          })
          // .on("mouseover", mouseover)
          // .on("mouseout", mouseout);
    }

    // function mouseover(p) {
    //   d3.selectAll(".row").classed("active", function(d, i) { return i == p.y; });
    //   d3.selectAll(".column").classed("active", function(d, i) { return i == p.x; });
    // }

    // function mouseout() {
    //   d3.selectAll("text").classed("active", false);
    // }



      // console.log(matrix_svg.selectAll(".cell")._groups[0]);
      // for (var i = 0; i < matrix_svg.selectAll(".cell")._groups[0].length; i++) {
      //   console.log(matrix_svg.selectAll(".cell")._groups[0][i]);
      // }


    d3.select("#order").on("change", function() {
      clearTimeout(timeout); // 自动换group，如果提前手动切换，则取消自动切换
      order(this.value);
    });

    function order(value) {
      x.domain(orders[value]);

      var t = matrix_svg.transition().duration(2500);

      t.selectAll(".row")
          .delay(function(d, i) { return x(i) * 4; })
          .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .selectAll(".cell")
          .delay(function(d) { return x(d.x) * 4; })
          .attr("x", function(d) { return x(d.x); });

      t.selectAll(".column")
          .delay(function(d, i) { return x(i) * 4; })
          .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }

    // 自动切换group 
    var timeout = setTimeout(function() {
      order("group");
      d3.select("#order").property("selectedIndex", 2).node().focus();
    }, 5000);
  });



  // function add_brush(){
  //   svg.append("g")
  //     .attr("class", "brush")
  //     .call(d3.brush().on("brush", brushed));


  //   function brushed(){
  //     choose_id = new Set();
  //     var s = d3.event.selection;
  //     // console.log(s);
  //     left_top = s[0];
  //     right_bottom = s[1];
  //     x_min = Math.min(s[0][0],s[1][0]);
  //     x_max = Math.max(s[0][0],s[1][0]);
  //     y_min = Math.min(s[0][1],s[1][1]);
  //     y_max = Math.max(s[0][1],s[1][1]);
  //     xy_max = Math.max(y_max,x_max);
  //     xy_min = Math.min(x_min,y_min);


  //     matrix_svg.selectAll(".cell")._groups[0].forEach(function(_t,i){
  //       var t = matrix_svg.selectAll(".cell")._groups[0][i];
  //       // console.log(t);
  //       if (t.x.baseVal.value < x_max && t.x.baseVal.value > x_min) {
  //         // console.log(t.__data__);
  //         choose_id.add(t.__data__.x);
  //         choose_id.add(t.__data__.y);
  //         // console.log(d3.select(t.data));
  //       }


  //     // matrix_svg.selectAll(".cell")
  //     //   .attr("fill",function(d){
  //     //     // if (choose_id.has(d.x)) {
  //     //     //   return "red";
  //     //     // }
  //     //     // else{
  //     //       return "black";
  //     //     // }
  //     //   })

  //       // console.log( < xy_max);
  //     })

    
  //     // console.log();
  //     // console.log(s.map(x.invert,x));
  //     // console.log(choose_id);
  //   }


  // }

  // add_brush();

}
draw_matrix();