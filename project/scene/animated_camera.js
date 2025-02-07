class AnimatedCamera extends Camera{
    constructor() {
        // lookAt and up are not used in this camera.
        super([0, 6,20],[0, 0, 0], [0, 1, 0]);

        this.direction = 1; // Used to determine the direction that the camera is following
        this.angle = 1; // angle between x and z

        // Radius of the circumference
        this.radius = Math.sqrt(Math.pow(this.position[0],2) + Math.pow(this.position[2],2))
    }

    #move(){
        // If the camera is in one of the axis
        // then change direction
        if (this.angle >89 || this.angle < 1){
            this.direction *= -1;
        }

        // How much does the camera turn
        // When it's close to an axis it's slower.
        let step = this.radius - Math.abs(this.position[0] - this.position[2]) + 1;
        this.angle +=  step * this.direction * .04;

        // x and z are determined using polar coordinates
        let rad = degToRad(this.angle);
        this.position[0] = Math.sin(rad) * this.radius;
        this.position[2] = Math.cos(rad) * this.radius;

    }

    MoveBackForwardCamera(step){
        if (this.radius < 5 && step > 0) return
        this.radius -=degToRad(step * 100 );
    }

    getViewMatrix() {
        this.#move();

        const look = [0,1,0] // the camera is always looking at the same point
        const cameraMatrix = m4.lookAt(this.position, look, [0,1,0]);
        return m4.inverse(cameraMatrix); // ViewMatrix
    }
}