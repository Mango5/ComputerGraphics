function degToRad(d) {
    return d * Math.PI / 180;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}

function createXYQuadVertices() {
    let xOffset = 0;
    let yOffset = 0;
    let size = 1;
    return {
        position: {
            numComponents: 2,
            data: [
                xOffset + -1 * size, yOffset + -1 * size,
                xOffset +  1 * size, yOffset + -1 * size,
                xOffset + -1 * size, yOffset +  1 * size,
                xOffset +  1 * size, yOffset +  1 * size,
            ],
        },
        normal: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ],
        texcoord: [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ],
        indices: [ 0, 1, 2, 2, 1, 3 ],
    };
}

function add_dat_gui(gui,scene){
   // let gui = new dat.gui.GUI({autoPlace: false});

   let skybox = {
        skybox : true
    }
   gui.add(skybox, 'skybox').onChange((value) => {
    scene.toggle_skybox(value);
    });

    let shadows = {
        shadows : false
    }
   gui.add(shadows, 'shadows').onChange((value) => {
    scene.toggle_shadows(value);
    });
  
     // controllers for the x, y, and z properties of lightPositionController
    let light_folder = gui.addFolder('Light controller');

    let light_position =  light_folder.addFolder('Position');
    var controllerXlight = light_position.add(scene.light.controller, 'x').min(-10).max(10).step(0.25).listen();
    var controllerYlight = light_position.add(scene.light.controller, 'y').min(0).max(10).step(0.25).listen();
    var controllerZlight = light_position.add(scene.light.controller, 'z').min(-10).max(10).step(0.25).listen();
    var colorController = light_folder.addColor(scene.light.controller, 'colorInHex').listen();
    // let light_direction =  light_folder.addFolder('Direction');
    // light_direction.add(scene.light.direction, 'x').min(-10).max(10).step(0.25);
    // light_direction.add(scene.light.direction, 'y').min(-10).max(10).step(0.25);
    // light_direction.add(scene.light.direction, 'z').min(-10).max(10).step(0.25);

    // let light_color =  light_folder.addFolder('Color');
    // light_color.add(scene.light.color, 0).min(0.1).max(1).step(0.05);
    // light_color.add(scene.light.color, 1).min(0.1).max(1).step(0.05);
    // light_color.add(scene.light.color, 2).min(0.1).max(1).step(0.05);

    // Update light.position array whenever the controllers change
    controllerXlight.onChange(function (value) {
      console.log(value);
      scene.light.position[0] = value;
    });
    controllerYlight.onChange(function (value) {
      console.log(value);
      scene.light.position[1] = value;
    });
    controllerZlight.onChange(function (value) {
      console.log(value);
      scene.light.position[2] = value;
    });
    colorController.onChange(function (value) {
      console.log(value);
      scene.light.colorInHex = value;
      // Convert the color from hexadecimal to RGB and normalize
      var color = hexToNormalizedRgb(value);
      scene.light.color = color;

      console.log("Normalized color: " + scene.light.color);
    });


    let shadow_folder = gui.addFolder('Shadow');
    shadow_folder.add(scene.shadow, "fov").min(30).max(180).step(15);
    shadow_folder.add(scene.shadow, "projWidth").min(1).max(10).step(1);
    shadow_folder.add(scene.shadow, "projHeight").min(1).max(10).step(1);
    shadow_folder.add(scene.shadow, "zFarProj").min(1).max(30).step(1);
    shadow_folder.add(scene.shadow, "bias").min(-0.001).max(0).step(0.0001);

    // scene['Toggle frustum'] = function () {
    //     scene.shadow.showFrustum = !scene.shadow.showFrustum;
    // };
    // shadow_folder.add(scene, 'Toggle frustum');
    let frustum = {
        frustum : false
    }
    shadow_folder.add(frustum, 'frustum').onChange((value) => {
    scene.toggle_shadowsFrustum(value);
    });

    document.getElementById("gui").append(gui.domElement)

}
//helper function to convert hexadecimal color to normalized RGB such as #ffffff to [1,1,1]
function hexToNormalizedRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  }
  
  //helper function that is called once at the page load to close the folders if the screen is small
  function closeFoldersOnMobile(gui) {
    if (window.innerWidth < 800) {
      gui.close();
    }
  }

function add_touch_canvas(scene){
    scene.mouse = [];

    function mouseDown(e) {
        scene.mouse.drag = true;
        scene.mouse.old_x = e.pageX;
        scene.mouse.old_y = e.pageY;
        e.preventDefault();
    }
    function mouseUp(){
        scene.mouse.drag=false;
    }
    function mouseMove(e) {
        if (!scene.mouse.drag){
            return false;
        }
        let dX=-(e.pageX-scene.mouse.old_x)*2*Math.PI/scene.canvas.width;
        scene.camera.moveLeftRightCamera(-dX * 0.2);
        let dY=-(e.pageY-scene.mouse.old_y)*2*Math.PI/scene.canvas.height;
        scene.camera.moveUpDownCamera(-dY * 0.2);

        scene.mouse.old_x=e.pageX;
        scene.mouse.old_y=e.pageY;
        e.preventDefault();
    }

    scene.canvas.addEventListener('touchstart',mouseDown,false);
    scene.canvas.addEventListener('touchmove',mouseMove,false);
    scene.canvas.addEventListener('touchend',mouseUp,false);
    scene.canvas.addEventListener('touchend',mouseUp,false);
    scene.canvas.addEventListener('mouseout',mouseUp,false);
    scene.canvas.onmousedown=mouseDown;
    scene.canvas.onmouseup=mouseUp;
    scene.canvas.mouseout=mouseUp;
    scene.canvas.onmousemove=mouseMove;
}

function canvas2DController(){
    let canvas = document.getElementById("touchCanvas");
    let context = canvas.getContext("2d");

    const up = new Path2D()
    up.rect(25,0,30,30)
    up.closePath()

    const down = new Path2D()
    down.rect(25,60,30,30)
    down.closePath()

    const left = new Path2D()
    left.rect(0,30,30,30)
    left.closePath()

    const right = new Path2D()
    right.rect(64,30,30,30)
    right.closePath()

    const forward = new Path2D()
    forward.rect(110,10,45,25)
    forward.closePath()

    const backward = new Path2D()
    backward.rect(110,55,45,25)
    backward.closePath()

    const image = new Image(190, 150);
    image.onload=function (){
        context.drawImage(this,  0, 0, image.width, image.height);
    }
    image.src = './data/controller.png';

    function getXY(canvas, event){ //adjust mouse click to canvas coordinates
        const rect = canvas.getBoundingClientRect()
        const y = event.pageY - rect.top
        const x = event.pageX - rect.left

        return {x:x, y:y}
    }

    function touchDown(e){
        const XY = getXY(canvas, e)
        //use the shape data to determine if there is a collision
        if(context.isPointInPath(forward, XY.x, XY.y)) {
            scene.keys["q"]=true;
        }
        if(context.isPointInPath(backward, XY.x, XY.y)) {
            scene.keys["e"]=true;
        }
        if(context.isPointInPath(left, XY.x, XY.y)) {
            scene.keys["a"]=true;
        }
        if(context.isPointInPath(right, XY.x, XY.y)) {
            scene.keys["d"]=true;
        }
        if(context.isPointInPath(up, XY.x, XY.y)) {
            scene.keys["w"]=true;
        }
        if(context.isPointInPath(down, XY.x, XY.y)) {
            scene.keys["s"]=true;
        }
    }

    function touchUp(){
        scene.keys["w"]=false;
        scene.keys["a"]=false;
        scene.keys["s"]=false;
        scene.keys["d"]=false;
        scene.keys["q"]=false;
        scene.keys["e"]=false;
    }

    canvas.addEventListener('touchstart',touchDown,false);
    canvas.addEventListener('touchend',touchUp,false);
    canvas.onmousedown=touchDown;
    canvas.onmouseup=touchUp;
}



