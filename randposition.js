const html = `
<style>
  body { margin: 0; }
  .extendedh { width: 100%; }
  .extendedv { height: 100%; }
  #wrapper {
    border: 2px solid blue;
    border-radius: 5px;
    background-color: rgba(111, 111, 111, 0.5);
    box-sizing: border-box;
    width: 300px;
  }
  .extendedh body, .extendedh #wrapper { width: 100%; }
  .extendedv body, .extendedv #wrapper { height: 100%; }
</style>
<div id="wrapper">
  <div class="btn-margin">
      <button id="btn-start" class="btn btn-outline-primary btn-lg">
          始める
      </button>
      <button id="btn-ans" class="btn btn-outline-primary btn-lg" disabled = true>
          答えを見る
      </button>
  </div>
  <div class="txt-margin">
  </div>
</div>
<script>
  let flag;


  const updateExtended = e => {
    if (e && e.horizontally) {
      document.documentElement.classList.add("extendedh");
    } else {
      document.documentElement.classList.remove("extendedh");
    }
    if (e && e.vertically) {
      document.documentElement.classList.add("extendedv");
    } else {
      document.documentElement.classList.remove("extendedv");
    }
  };

  window.addEventListener("message", e => {
    var rand = e.data;

  document.getElementById("btn-ans").onclick = function(){
    document.getElementById("btn-ans").disabled =false;
    document.getElementById("btn-start").disabled =false;
    flag = 2;
    parent.postMessage({flag,rand}, "*");
  };


  });

  document.getElementById("btn-start").onclick = function(){
    document.getElementById("btn-ans").disabled =false;
    document.getElementById("btn-start").disabled =true;
    flag = 1;
    parent.postMessage({flag }, "*");
  };
  document.getElementById("btn-ans").onclick = function(){
    document.getElementById("btn-ans").disabled =false;
    document.getElementById("btn-start").disabled =false;
    flag = 2;
    parent.postMessage({flag,randX,randY }, "*");
  };





  

  updateExtended(${JSON.stringify(reearth.widget.extended || null)});


</script>
`;

reearth.ui.show(html);

reearth.on("update", () => {
  reearth.ui.postMessage({
    extended: reearth.widget.extended,
    randX: randX,
    randY: randY,
  });
});


reearth.on("message", msg => {
  if (msg.flag == 1) {
    var viewrange = reearth.visualizer.camera.viewport;
    // make random
    var randX = Math.random() * (viewrange.east - viewrange.west) + viewrange.west;
    var randY = Math.random() * (viewrange.north - viewrange.south) + viewrange.south;
    reearth.ui.postMessage({
      randX: randX,
      randY: randY,
    });
  }

  if (msg.flag == 1) {

    // make czml
    var czml = [
      {
        id: "document",
        name: "rectangle",
        version: "1.0",
      },
      {
        id: "redPolygon",
        name: "Red polygon on surface",
        polygon: {
          positions: {
            cartographicDegrees: [
              viewrange.west,
              viewrange.north,
              0,
              viewrange.east,
              viewrange.north,
              0,
              viewrange.east,
              viewrange.south,
              0,
              viewrange.west,
              viewrange.south,
              0,
            ],
          },
          material: {
            solidColor: {
              color: {
                rgba: [255, 0, 0, 0],
              },
            },
          },
          extrudedHeight: 0,
          perPositionHeight: true,
          outline: true,
          outlineColor: {
            rgba: [255, 0, 0, 255],
          },
        },
      },
    ];



    // put icon
    let mytag = reearth.widget.property.default.positiontag;
    let myposition_tmp = reearth.layers.findByTagLabels(mytag);
    let myposition = myposition_tmp.flatMap(ch => (ch.children || [ch]));
    if (myposition) {
      for (let i = 0; i < myposition.length; i++) {
        reearth.layers.overrideProperty(myposition[i].id, {
          default: {
            location: { lat: randY, lng: randX },
            height: 0
          }
        });
      }
    }
    // show rectangle
    let rectangletag = reearth.widget.property.default.filetag;
    let layers = reearth.layers.findByTagLabels(rectangletag);
    let files = layers.find((v) => v.type === "resource");
    if (files) {
      // refresh
      reearth.layers.overrideProperty(files.id, {
        default: {
          url: [],
          type: "czml"
        }
      });
      // rendaer
      reearth.layers.overrideProperty(files.id, {
        default: {
          url: czml,
          type: "czml"
        }
      });
    } else {
      alert('file tagが設定されているファイルレイヤがないため、範囲は表示されません。');
    }
  } else if (msg.flag == 2) {
    reearth.visualizer.camera.flyTo({
      lat: msg.rand.randY,
      lng: msg.rand.randX,
      height: 90,
      heading: 0,
      pitch: -90 * (Math.PI / 180),
      roll: 0,
    }, {
      duration: 5
    });
  }
});


