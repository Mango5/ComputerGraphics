// WebGL App

function main(){
    // Creating a new scene from a file
    window["scene"] = new Scene("mainCanvas", "./scene/scene.json");

    // Adding event listener for keyboard
    window.addEventListener('keydown', (e) => {scene.keys[e.key] = true;});
    window.addEventListener('keyup', (e) => {scene.keys[e.key] = false;});

    canvas2DController();
    const gui = new dat.gui.GUI({autoPlace: false});
    add_dat_gui(gui,scene);
    closeFoldersOnMobile(gui);
    add_touch_canvas(scene);
    draw(scene);
}

main();