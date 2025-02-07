class Scene {
    // Scene constructor
    constructor(canvas_id, json_path){
        // Getting WebGL context from canvas
        this.canvas = document.getElementById(canvas_id);
        this.gl = this.canvas.getContext("webgl");
        this.gl.getExtension("OES_standard_derivatives");

        if (!this.gl) { // Check if WebGL is supported
            alert("WebGL not supported!");
            throw new Error("WebGL not supported!");
        }

        this.ext = this.gl.getExtension('WEBGL_depth_texture');
        if (!this.ext) {
            return alert('need WEBGL_depth_texture');  // eslint-disable-line
        }

        this.path = json_path;

        this.gl.enable(this.gl.DEPTH_TEST);

        this.program = webglUtils.createProgramInfo(this.gl, ["base-vertex-shader", "base-fragment-shader"]);

        this.prepareSkybox().then(() => {});
        this.prepareShadows().then(() => {});

        this.mesh_list = []; // Array used to store all the mesh used in the scene
        this.load_mesh_json(json_path).then(() => {});

        // Creating a camera for this scene
        const position = [20,4,20], target = [0, 4, 0], up = [0, 1, 0];
        this.camera = new Camera(position, target, up);
        this.keys = {};

        // Light used in the scene
        this.light = {
            position: [10,5,2],
            direction : [1,1,1], 
            color : [1.0, 1.0, 1.0],
            colorInHex: "#ffffff", 
            ambient: [0.1,0.1,0.1]
            };
        this.light.controller= {
                x: this.light.position[0],
                y: this.light.position[1],
                z: this.light.position[2],
                color: this.light.color,
                colorInHex: this.light.colorInHex
            };

    }

    // Function that loads a list of meshes from a json file
    // and then creates all the  mesh objects that will be used.
    async load_mesh_json(json_path){
        const response = await fetch(json_path);
        const json = await response.json();
        json.meshes.forEach(obj => {
            if(obj.mirror){
                this.mesh_list.push(new Mirror(obj, this.gl));
            }else{
                this.mesh_list.push(new MeshObj(obj, this.gl));
            }
        });
    }

    // Compute the projection matrix
    projectionMatrix(){
        let fieldOfViewRadians = degToRad(60);
        let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        let zmin=0.1;
        return m4.perspective(fieldOfViewRadians, aspect, zmin, 200);
    }

    // Move the camera using keyboard
    key_controller(){
        let step = 0.05;

        if (this.keys["w"]){
            this.camera.moveUpDownTarget(step)
        }
        if (this.keys["s"]){
            this.camera.moveUpDownTarget(-step)
        }
        if (this.keys["a"]){
            this.camera.moveLeftRightTarget(-step)
        }
        if (this.keys["d"]){
            this.camera.moveLeftRightTarget(step)
        }
        if (this.keys["q"]){
            this.camera.MoveBackForwardCamera(step)
        }
        if (this.keys["e"]){
            this.camera.MoveBackForwardCamera(-step)
        }
        if (this.keys["h"]){
            this.camera.rotateCamera(-step)
        }
        if (this.keys["k"]){
            this.camera.rotateCamera(step)
        }
        if (this.keys["ArrowUp"]){
            this.camera.moveUpDownCamera(step)
        }
        if (this.keys["ArrowDown"]){
            this.camera.moveUpDownCamera(-step)
        }
        if (this.keys["ArrowLeft"]){
            this.camera.moveLeftRightCamera(step)
        }
        if (this.keys["ArrowRight"]){
            this.camera.moveLeftRightCamera(-step)
        }
        if (this.keys["r"]){
            this.camera.align()
        }
    }

    //Change the type of camera, AnimatedCamera or Camera
    switch_camera(){
        if (this.camera instanceof AnimatedCamera){
            const position = [10,2,10], target = [0, 2, 0], up = [0, 1, 0];
            this.camera = new Camera(position, target, up);
        }else{
            this.camera = new AnimatedCamera();
        }
    }

    // Load cubemap texture for skybox
    async prepareSkybox(){
        this.skybox = [];
        this.skybox.programInfo = webglUtils.createProgramInfo( this.gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
        const arrays2 = createXYQuadVertices.apply(null,  Array.prototype.slice.call(arguments, 1));
        this.skybox.quadBufferInfo = webglUtils.createBufferInfoFromArrays(this.gl, arrays2);
        this.skybox.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.skybox.texture);

        const faceInfos = [
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: './data/Vindelalven/posx.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: './data/Vindelalven/negx.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: './data/Vindelalven/posy.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: './data/Vindelalven/negy.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: './data/Vindelalven/posz.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: './data/Vindelalven/negz.jpg',
            },

        ]; 

        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 1024;
            const height = 1024;
            const format = this.gl.RGBA;
            const type = this.gl.UNSIGNED_BYTE;
            this.gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

            const image = new Image();
            image.src = url;

            let gl = this.gl;
            let scene = this;

            image.addEventListener('load', function() {
                // Now that the image has loaded make copy it to the texture.
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.skybox.texture);
                gl.texImage2D(target, level, internalFormat, format, type, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.skybox.enable = true;
    }

    // Create a
    async prepareShadows(){
        // Obj containing all variables used for shadows
        this.shadow = [];

        // Program used to draw from the light perspective
        this.colorProgramInfo = webglUtils.createProgramInfo(this.gl, ['color-vertex-shader', 'color-fragment-shader']);

        // Program used to draw from the camera perspective
        this.textureProgramInfo = webglUtils.createProgramInfo(this.gl, ['vertex-shader-3d', 'fragment-shader-3d']);

        // Shadow map texture
        this.shadow.depthTexture = this.gl.createTexture();
        this.shadow.depthTextureSize = 4096; // Texture resolution
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.shadow.depthTexture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,                 // target
            0,                                  // mip level
            this.gl.DEPTH_COMPONENT,            // internal format
            this.shadow.depthTextureSize,       // width
            this.shadow.depthTextureSize,       // height
            0,                                  // border
            this.gl.DEPTH_COMPONENT,            // format
            this.gl.UNSIGNED_INT,               // type
            null);                              // data
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.shadow.depthFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadow.depthFramebuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,            // target
            this.gl.DEPTH_ATTACHMENT,       // attachment point
            this.gl.TEXTURE_2D,             // texture target
            this.shadow.depthTexture,       // texture
            0);                       // mip level

        // Shadow settings
        this.shadow.enable = false;
        this.shadow.fov = 60;
        this.shadow.projWidth = 2;
        this.shadow.projHeight = 2;
        this.shadow.zFarProj = 20;
        this.shadow.bias = -0.0001;
        this.shadow.showFrustum = false;
    }

    // Enable/Disable skybox drawing
    toggle_skybox(val){
       this.skybox.enable = val;
    }

    toggle_shadows(val){
        this.shadow.enable = val;
    }

    toggle_shadowsFrustum(val){
        this.shadow.showFrustum = val;
    }

    async reload_scene(){
        this.mesh_list = [];
        await this.load_mesh_json(this.path);
    }

}

// Draw everything in the scene on the canvas.
function draw() {
    // Resizing the canvas to the window size
    resizeCanvasToDisplaySize(scene.gl.canvas);
    scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);
    scene.key_controller();

    scene.gl.enable(scene.gl.CULL_FACE);
    scene.gl.enable(scene.gl.DEPTH_TEST);
    scene.gl.enable(scene.gl.BLEND);
    scene.gl.blendFunc(scene.gl.SRC_ALPHA, scene.gl.ONE_MINUS_SRC_ALPHA);

    let proj = scene.projectionMatrix()
    let view = scene.camera.getViewMatrix()

    function bindFrameBufferNull(){
        // draw scene to the canvas projecting the depth texture into the scene
        scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, null);
        scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);
        scene.gl.clearColor(0, 0, 0, 1);
        scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
    }

    if(scene.shadow.enable){
        const lightWorldMatrix = m4.lookAt(
            scene.light.position,       // position
            scene.light.direction,      // target
            [0, 1, 0],                  // up
        );

        const lightProjectionMatrix = m4.perspective(
            degToRad(scene.shadow.fov),
            scene.shadow.projWidth / scene.shadow.projHeight,
            0.5,                        // near
            scene.shadow.zFarProj);     // far

        let sharedUniforms = {
            u_view: m4.inverse(lightWorldMatrix),                  // View Matrix
            u_projection: lightProjectionMatrix,                   // Projection Matrix
            u_bias: scene.shadow.bias,
            u_textureMatrix: m4.identity(),
            u_projectedTexture: scene.shadow.depthTexture,
            u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
        };

        // draw to the depth texture
        scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, scene.shadow.depthFramebuffer);
        scene.gl.viewport(0, 0, scene.shadow.depthTextureSize, scene.shadow.depthTextureSize);
        scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);

        scene.mesh_list.forEach(m => {
            m.render(scene.gl, scene.colorProgramInfo, sharedUniforms);
        });

        bindFrameBufferNull()

        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
        // use the inverse of this world matrix to make
        // a matrix that will transform other positions
        // to be relative this world space.
        textureMatrix = m4.multiply(
            textureMatrix,
            m4.inverse(lightWorldMatrix));


        sharedUniforms = {
            u_view: scene.camera.getViewMatrix(),
            u_projection: proj,
            u_bias: scene.shadow.bias,
            u_textureMatrix: textureMatrix,
            u_projectedTexture: scene.shadow.depthTexture,
            u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
            u_worldCameraPosition: scene.camera.getPosition(),
        };

        scene.mesh_list.forEach(m => {
            m.render(scene.gl, scene.textureProgramInfo, sharedUniforms);
        });

        if (scene.shadow.showFrustum){
            scene.gl.useProgram(scene.colorProgramInfo.program);
            const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(scene.gl, {
                position: [
                    -1, -1, -1,
                    1, -1, -1,
                    -1,  1, -1,
                    1,  1, -1,
                    -1, -1,  1,
                    1, -1,  1,
                    -1,  1,  1,
                    1,  1,  1,
                ],
                indices: [
                    0, 1,
                    1, 3,
                    3, 2,
                    2, 0,

                    4, 5,
                    5, 7,
                    7, 6,
                    6, 4,

                    0, 4,
                    1, 5,
                    3, 7,
                    2, 6,
                ],
            });

            webglUtils.setBuffersAndAttributes(scene.gl, scene.colorProgramInfo, cubeLinesBufferInfo);

            const mat = m4.multiply(
                lightWorldMatrix, m4.inverse(lightProjectionMatrix));

            webglUtils.setUniforms(scene.colorProgramInfo, {
                u_color: [1, 1, 1, 1],
                u_view: view,
                u_projection: proj,
                u_world: mat,
            });

            webglUtils.drawBufferInfo(scene.gl, cubeLinesBufferInfo, scene.gl.LINES);
        }

    }else{
        bindFrameBufferNull()

        const sharedUniforms = {
            u_ambientLight: scene.light.ambient,                      // Ambient
            u_lightDirection: m4.normalize(scene.light.direction),    // Light Direction
            u_lightColor: scene.light.color,                          // Light Color
            u_view: scene.camera.getViewMatrix(),                     // View Matrix
            u_projection: scene.projectionMatrix(),                   // Projection Matrix
            u_viewWorldPosition: scene.camera.getPosition(),          // Camera position
            u_lightPosition: (scene.light.position),
        };

        scene.mesh_list.forEach(m => {
            m.render(scene.gl, scene.program, sharedUniforms);
        });
    }

    if (scene.skybox.enable){
        // Removing translation from view matrix
        view[12] = 0;
        view[13] = 0;
        view[14] = 0;
        scene.gl.depthFunc(scene.gl.LEQUAL);
        scene.gl.useProgram(scene.skybox.programInfo.program);

        webglUtils.setBuffersAndAttributes(scene.gl, scene.skybox.programInfo, scene.skybox.quadBufferInfo);
        webglUtils.setUniforms(scene.skybox.programInfo, {
            u_viewDirectionProjectionInverse: m4.inverse(m4.multiply(proj, view)),
            u_skybox: scene.skybox.texture,
            u_lightColor: scene.light.color,
        });
        webglUtils.drawBufferInfo(scene.gl, scene.skybox.quadBufferInfo);
        scene.gl.depthFunc(scene.gl.LESS);
    }

    requestAnimationFrame(draw);
}