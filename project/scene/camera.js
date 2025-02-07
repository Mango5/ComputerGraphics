class Camera {
    constructor(pos, lookAt, up){
        this.position = pos
        this.forward = m4.normalize(m4.subtractVectors(lookAt, pos));
        this.right = m4.normalize(m4.cross(this.forward, up));
        this.up = m4.normalize(m4.cross(this.right, this.forward));
    }

    
    // Rotates a camera’s view up or down. 
    moveUpDownCamera(step){ //tilt
        let rotation = m4.axisRotation(this.right, (step / 2));
        this.forward = m4.transformPoint(rotation, this.forward)
        this.up = m4.transformPoint(rotation, this.up)

        this.forward = m4.normalize(this.forward);
        this.up = m4.normalize(this.up)
    }

    // Rotates the camera’s view horizontally about the camera’s eye location
    moveLeftRightCamera(step){ //pan
        let rotation = m4.axisRotation(this.up, step);
        this.forward = m4.transformPoint(rotation,this.forward);
        this.right = m4.transformPoint(rotation,this.right);

        this.forward = m4.normalize(this.forward);
        this.right = m4.normalize(this.right);
    }

    // Rotate a camera sideways while maintaining its location and viewing direction.
    rotateCamera(step){ //cant
        let rotation = m4.axisRotation(this.forward, (step / 2));
        this.right = m4.transformPoint(rotation, this.right)
        this.up = m4.transformPoint(rotation, this.up)

        this.right = m4.normalize(this.right);
        this.up = m4.normalize(this.up);
    }

    // Moves the target laterally(left or right) while the camera’s direction of view is unchanged.
    moveLeftRightTarget(dist){ //truck
        this.position[0] += + (this.right[0] * dist);
        this.position[1] += + (this.right[1] * dist);
        this.position[2] += + (this.right[2] * dist);
    }

    // Moves the target vertically (up or down) while the camera’s direction of view is unchanged.
    moveUpDownTarget(dist){ //pedestal
        this.position[0] += (this.up[0] * dist);
        this.position[1] += (this.up[1] * dist);
        this.position[2] += (this.up[2] * dist);
    }

    // Moves a camera closer to, or further from, the target  it is looking at.
    MoveBackForwardCamera(dist){ //dolly
        this.position[0] += (this.forward[0] * dist);
        this.position[1] += (this.forward[1] * dist);
        this.position[2] += (this.forward[2] * dist);
    }

    // Realign the camera
    align(){
        this.up=[0,1,0];
        this.forward[1] = 0;
        this.right = m4.normalize(m4.cross(this.forward, this.up));
    }

    // Return the view matrix
    getViewMatrix(){
        const look = m4.addVectors(this.position, this.forward);
        const cameraMatrix = m4.lookAt(this.position, look, this.up);
        return m4.inverse(cameraMatrix); // ViewMatrix
    };

    // Return lookAt
    getLookAt() {
        const look = m4.addVectors(this.position, this.forward);
        /** function lookAt( eye, at, up ){}
         * eye: camera position 
         * at : target position
         *  up : View-Up vector 
         * */
        return m4.lookAt(this.position, look, this.up);

    };

    // Return this.position
    getPosition(){
        return this.position
    }

}