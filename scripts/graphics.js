// ------------------------------------------------------------------
// 
// This is the graphics object.  It provides a pseudo pixel rendering
// space for use in demonstrating some basic rendering techniques.
//
// ------------------------------------------------------------------
MySample.graphics = (function(pixelsX, pixelsY, showPixels) {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let context = canvas.getContext('2d', { alpha: false });

    let deltaX = canvas.width / pixelsX;
    let deltaY = canvas.height / pixelsY;

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();

        //
        // Draw a very light background to show the "pixels" for the framebuffer.
        if (showPixels) {
            context.save();
            context.lineWidth = .1;
            context.strokeStyle = 'rgb(150, 150, 150)';
            context.beginPath();
            for (let y = 0; y <= pixelsY; y++) {
                context.moveTo(1, y * deltaY);
                context.lineTo(canvas.width, y * deltaY);
            }
            for (let x = 0; x <= pixelsX; x++) {
                context.moveTo(x * deltaX, 1);
                context.lineTo(x * deltaX, canvas.width);
            }
            context.stroke();
            context.restore();
        }
    }

    //------------------------------------------------------------------
    //
    // Public function that renders a "pixel" on the framebuffer.
    //
    //------------------------------------------------------------------
    function drawPixel(x, y, color) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        context.fillStyle = color;
        context.fillRect(x * deltaX, y * deltaY, deltaX, deltaY);
    }

    //------------------------------------------------------------------
    //
    // Helper function used to draw an X centered at a point.
    //
    //------------------------------------------------------------------
    function drawPoint(x, y, ptColor) {
        drawPixel(x - 1, y - 1, ptColor);
        drawPixel(x + 1, y - 1, ptColor);
        drawPixel(x, y, ptColor);
        drawPixel(x + 1, y + 1, ptColor);
        drawPixel(x - 1, y + 1, ptColor);
    }

    //------------------------------------------------------------------
    //
    // Bresenham line drawing algorithm.
    //
    //------------------------------------------------------------------
    function BresenhamY(x, y, dy, dx, color, increase){
        var less = 2 * (dy);
        var greater = less - 2 * (dx);
        var P_k = less - (dx);
        for (let i = 0; i <= dx; i++){
            drawPixel(y, x, color);
            if (P_k >= 0) {
                y ++;
                P_k += greater;
            }
            else {
                P_k += less;
            }
            x+= increase;
        }
    }

    function BresenhamX(x, y, dy, dx, color, increase){
        var less = 2 * (dy);
        var greater = less - 2 * (dx);
        var P_k = less - (dx);
        for (let i = 0; i <= dx; i++){
            drawPixel(x, y, color);
            if (P_k >= 0) {
                y ++;
                P_k += greater;
            }
            else {
                P_k += less;
            }
            x+= increase;
        }
    }
    
    function drawLine(x1, y1, x2, y2, color) {
        // these octants are done mathematically, visually it is just inversed across the x axis
        // because 0,0 is the top left corner of the screen
        let dx = Math.abs(x2-x1);
        let dy = Math.abs(y2-y1);

        // octants 0, 3, 4, and 7 were a little difficult. The math was pretty simple
        // and I used google to figure out about swapping in the drawPixel function.
        // then I just used trial and error on the x, y, and increase inputs.

        // octants 0-3
        if (x1 < x2){
            //octants 0&1 etc.
            if (y1 < y2){
                //1
                if (dx >= dy){
                    BresenhamX(x1, y1, dy, dx, color, 1);
                }
                //0
                else{
                    BresenhamY(y1, x1, dx, dy, color, 1);
                }
            }
            else{
                //2
                if (dx >= dy){
                    BresenhamX(x2, y2, dy, dx, color, -1);
                }
                //3
                else{
                    BresenhamY(y1, x1, dx, dy, color, -1);
                }
            }
        }
        else {
            if (y1 < y2){
                //6
                if (dx >= dy){
                    BresenhamX(x1, y1, dy, dx, color, -1);
                }
                //7
                else{
                    BresenhamY(y2, x2, dx, dy, color, -1);
                }
            }
            else{
                //5
                if (dx >= dy){
                    BresenhamX(x2, y2, dy, dx, color, 1);
                }
                //4
                else{
                    BresenhamY(y2, x2, dx, dy, color, 1);
                }
            } 
        }
    }


    //------------------------------------------------------------------
    //
    // Renders an Hermite curve based on the input parameters.
    //
    //------------------------------------------------------------------
    let hermite_u = [];
    function drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor) {
        
        let prev_x = controls[0][0];
        let prev_y = controls[0][1];
        if (showPoints){
            drawPoint(prev_x, prev_y, lineColor);
        }

        // memoize
        for (let i = 1; i <= segments; i++){
            let u = i/segments;
            let location = Math.trunc(u * 1000);

            if (hermite_u[location] === undefined){
                let u_2 = u * u; 
                let u_3 = u * u * u;
                hermite_u[location] = [];
                hermite_u[location][0] = 2 * u_3 - 3 * u_2 + 1;
                hermite_u[location][1] = -2 * u_3 + 3 * u_2;
                hermite_u[location][2] = u_3 - 2 * u_2 + u;
                hermite_u[location][3] = u_3 - u_2;
            }
        }
        
        for (let i = 1; i <= segments; i++){
            let location = Math.trunc(i/segments * 1000);
            let new_x = controls[0][0] * (hermite_u[location][0]) + controls[1][0] * (hermite_u[location][1]) + controls[2][0] * (hermite_u[location][2]) + controls[3][0] * (hermite_u[location][3]);
            let new_y = controls[0][1] * (hermite_u[location][0]) + controls[1][1] * (hermite_u[location][1]) + controls[2][1] * (hermite_u[location][2]) + controls[3][1] * (hermite_u[location][3]);

            if (showLine){
                drawLine(prev_x, prev_y, new_x, new_y, lineColor);
            }
            if (showPoints){
                drawPoint(new_x, new_y, lineColor);
            }
            prev_x = new_x;
            prev_y = new_y;
        }

        if (showControl){
            drawLine(controls[0][0], controls[0][1], controls[0][0] + controls[2][0], controls[0][1] + controls[2][1], lineColor);
            drawLine(controls[1][0], controls[1][1], controls[1][0] + controls[3][0], controls[1][1] + controls[3][1], lineColor);
        }
    }

    //------------------------------------------------------------------
    //
    // Renders a Cardinal curve based on the input parameters.
    //
    //------------------------------------------------------------------
    let cardinal_u = [];
    function drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor) {
        let t_location = Math.trunc(controls[4][0] * 1000)
        let s = (1-controls[4][0])/2;

        let prev_x = controls[0][0];
        let prev_y = controls[0][1];
        if (showPoints){
            drawPoint(prev_x, prev_y, lineColor);
        }

        // memoize
        for (let i = 1; i <= segments; i++){
            let u = i/segments;
            let location = Math.trunc(u * 1000);

            if (cardinal_u[location] === undefined){
                cardinal_u[location] = [];
            }
            if (cardinal_u[location][t_location] === undefined){
                let u_2 = u * u; 
                let u_3 = u * u * u;
                cardinal_u[location][t_location] = [];
                cardinal_u[location][t_location][0] = (-s) * u_3 + 2 * s * u_2 - s * u;
                cardinal_u[location][t_location][1] = (2-s) * u_3 + (s-3) * u_2 + 1;
                cardinal_u[location][t_location][2] = (s-2) * u_3 + (3-(2*s)) * u_2 + s * u;
                cardinal_u[location][t_location][3] = s * u_3 - s * u_2;
            }
        }

        for (let i = 1; i <= segments; i++){
            let location = Math.trunc(i/segments*1000)
            let new_x = controls[2][0] * (cardinal_u[location][t_location][0]) + controls[0][0] * (cardinal_u[location][t_location][1]) + controls[1][0] * (cardinal_u[location][t_location][2]) + controls[3][0] * (cardinal_u[location][t_location][3]);
            let new_y = controls[2][1] * (cardinal_u[location][t_location][0]) + controls[0][1] * (cardinal_u[location][t_location][1]) + controls[1][1] * (cardinal_u[location][t_location][2]) + controls[3][1] * (cardinal_u[location][t_location][3]);

            if (showLine){
                drawLine(prev_x, prev_y, new_x, new_y, lineColor);
            }
            if (showPoints){
                drawPoint(new_x, new_y, lineColor);
            }
            prev_x = new_x;
            prev_y = new_y;
        }
        if (showControl){
            drawPoint(controls[0][0], controls[0][1], lineColor);
            drawPoint(controls[1][0], controls[1][1], lineColor);
            drawPoint(controls[2][0], controls[2][1], lineColor);
            drawPoint(controls[3][0], controls[3][1], lineColor);
        }
    }

    //------------------------------------------------------------------
    //
    // Renders a Bezier curve based on the input parameters.
    //
    //------------------------------------------------------------------
    let lookup = [1, 1, 2, 6];
    let bezier_u = [];
    function drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor) {
        if (controls.length != 4){
            return;
        }
        let prev_x = controls[0][0];
        let prev_y = controls[0][1];
        if (showPoints){
            drawPoint(prev_x, prev_y, lineColor);
        }

        // memoize
        for (let i = 1; i <= segments; i++){
            let u = i/segments;
            let location = Math.trunc(u * 1000);
            let n = controls.length - 1;
            if (bezier_u[location] === undefined){
                bezier_u[location] = [];
                for (let k = 0; k < 4; k ++){
                    bezier_u[location][k] = (lookup[n]/(lookup[k] * lookup[n-k])) * Math.pow(u, k) * Math.pow(1-u, n-k)
                }
            }
        }

        for (let i = 1; i <= segments; i++){
            let location = Math.trunc(i/segments * 1000);

            let new_x = controls[0][0] * (bezier_u[location][0]) + controls[1][0] * (bezier_u[location][1]) + controls[2][0] * (bezier_u[location][2]) + controls[3][0] * (bezier_u[location][3]);
            let new_y = controls[0][1] * (bezier_u[location][0]) + controls[1][1] * (bezier_u[location][1]) + controls[2][1] * (bezier_u[location][2]) + controls[3][1] * (bezier_u[location][3]);

            if (showLine){
                drawLine(prev_x, prev_y, new_x, new_y, lineColor);
            }
            if (showPoints){
                drawPoint(new_x, new_y, lineColor);
            }
            prev_x = new_x;
            prev_y = new_y;
        }
        if (showControl){
            drawPoint(controls[0][0], controls[0][1], lineColor);
            drawPoint(controls[1][0], controls[1][1], lineColor);
            drawPoint(controls[2][0], controls[2][1], lineColor);
            drawPoint(controls[3][0], controls[3][1], lineColor);
        }
    }

    //------------------------------------------------------------------
    //
    // Renders a Bezier curve based on the input parameters; using the matrix form.
    // This follows the Mathematics for Game Programmers form.
    //
    //------------------------------------------------------------------
    let bezier_matrix_u = [];
    function drawCurveBezierMatrix(controls, segments, showPoints, showLine, showControl, lineColor) {
        if (controls.length != 4){
            return;
        }
        
        let prev_x = controls[0][0];
        let prev_y = controls[0][1];
        if (showPoints){
            drawPoint(prev_x, prev_y, lineColor);
        }


        // memoize
        for (let i = 1; i <= segments; i++){
            let u = i/segments;
            let location = Math.trunc(u * 1000);
            // let n = controls.length - 1;
            if (bezier_matrix_u[location] === undefined){
                let u_2 = u * u;
                let u_3 = u * u * u;

                // let matrix1 = [u_3, u_2, u, 1];
                // let matrix2 = [
                //     [1,-3,3,-1],
                //     [0,3,-6,3],
                //     [0,0,3,-3],
                //     [0,0,0,1],
                // ];

                bezier_matrix_u[location] = [];
                bezier_matrix_u[location][3] = u_3;
                bezier_matrix_u[location][2] = 3*u_2 - 3*u_3;
                bezier_matrix_u[location][1] = 3 * u_3 - 6*u_2 + 3 * u;
                bezier_matrix_u[location][0] = 3*u_2 - u_3 - 3 * u + 1;
                
                // bezier_matrix_u[location] = [];
                // for (let k = 0; k < 4; k ++){
                //     bezier_matrix_u[location][k] = (lookup[n]/(lookup[k] * lookup[n-k])) * Math.pow(u, k) * Math.pow(1-u, n-k)
                // }
            }
        }


        for (let i = 1; i <= segments; i++){
            let location = Math.trunc(i/segments * 1000);

            let new_x = controls[0][0] * (bezier_matrix_u[location][0]) + controls[1][0] * (bezier_matrix_u[location][1]) + controls[2][0] * (bezier_matrix_u[location][2]) + controls[3][0] * (bezier_matrix_u[location][3]);
            let new_y = controls[0][1] * (bezier_matrix_u[location][0]) + controls[1][1] * (bezier_matrix_u[location][1]) + controls[2][1] * (bezier_matrix_u[location][2]) + controls[3][1] * (bezier_matrix_u[location][3]);

            if (showLine){
                drawLine(prev_x, prev_y, new_x, new_y, lineColor);
            }
            if (showPoints){
                drawPoint(new_x, new_y, lineColor);
            }
            prev_x = new_x;
            prev_y = new_y;
        }

        if (showControl){
            drawPoint(controls[0][0], controls[0][1], lineColor);
            drawPoint(controls[1][0], controls[1][1], lineColor);
            drawPoint(controls[2][0], controls[2][1], lineColor);
            drawPoint(controls[3][0], controls[3][1], lineColor);
        }
        
    }

    //------------------------------------------------------------------
    //
    // Entry point for rendering the different types of curves.
    // I know a different (functional) JavaScript pattern could be used
    // here.  My goal was to keep it looking C++'ish to keep it familiar
    // to those not expert in JavaScript.
    //
    //------------------------------------------------------------------
    function drawCurve(type, controls, segments, showPoints, showLine, showControl, lineColor) {
        switch (type) {
            case api.Curve.Hermite:
                drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.Cardinal:
                drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.Bezier:
                drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.BezierMatrix:
                drawCurveBezierMatrix(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
        }
    }

    //------------------------------------------------------------------
    //
    // Renders a primitive of the form: {
    //    verts: [ x, y, ...],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    // 
    // connect: If true, the last vertex and first vertex have a line drawn between them.
    //
    // color: The color to use when drawing the lines
    //
    //------------------------------------------------------------------
    function drawPrimitive(primitive, connect, color) {
        for (let i = 0; i < primitive.verts.length - 2; i +=2){
            drawLine(primitive.verts[i] + primitive.center.x, primitive.verts[i+1] + primitive.center.y, primitive.verts[i+2] + primitive.center.x, primitive.verts[i+3] + primitive.center.y, color);
        }
        if (connect){
            drawLine(primitive.verts[0] + primitive.center.x, primitive.verts[1] + primitive.center.y, primitive.verts[primitive.verts.length - 2] + primitive.center.x, primitive.verts[primitive.verts.length-1] + primitive.center.y, color);
        }
    }

    //------------------------------------------------------------------
    //
    // Translates a point of the form: { x, y }
    //
    // distance: { x, y }
    //
    //------------------------------------------------------------------
    function translatePoint(point, distance) {
        point.x += distance.x;
        point.y += distance.y;
    }

    //------------------------------------------------------------------
    //
    // Translates a primitive of the form: {
    //    verts: [],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    //
    // distance: { x, y }
    //
    //------------------------------------------------------------------
    function translatePrimitive(primitive, distance){
        primitive.center.x += distance.x;
        primitive.center.y += distance.y;
    }

    //------------------------------------------------------------------
    //
    // Scales a primitive of the form: {
    //    verts: [],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    //
    // scale: { x, y }
    //
    //------------------------------------------------------------------
    function scalePrimitive(primitive, scale){
        for (let i = 0; i < primitive.verts.length - 1; i += 2){
            primitive.verts[i] *= scale.x;
            primitive.verts[i+1] *= scale.y;
        }
    }

    //------------------------------------------------------------------
    //
    // Rotates a primitive of the form: {
    //    verts: [],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    //
    // angle: radians
    //
    //------------------------------------------------------------------
    function rotatePrimitive(primitive, angle){
        for (let i = 0; i < primitive.verts.length - 1; i+=2){
            let newx = primitive.verts[i]*Math.cos(angle) - primitive.verts[i+1] * Math.sin(angle);
            let newy = primitive.verts[i]*Math.sin(angle) + primitive.verts[i+1] * Math.cos(angle);
            primitive.verts[i] = newx;
            primitive.verts[i+1] = newy;
        }
    }

    //------------------------------------------------------------------
    //
    // Translates a curve.
    //    type: Cardinal, Bezier
    //    controls: appropriate to the curve type
    //    distance: { x, y }
    //
    //------------------------------------------------------------------
    function translateCurve(type, controls, distance){
        for (let i = 0; i < 4; i ++){
            controls[i][0] += distance.x;
            controls[i][1] += distance.y;
        }
    }

    //------------------------------------------------------------------
    //
    // Scales a curve relative to its center.
    //    type: Cardinal, 
    //    controls: appropriate to tBezierhe curve type
    //    scale: { x, y }
    //
    //------------------------------------------------------------------
    function scaleCurve(type, controls, scale){
        let center = {x: 0, y: 0};
        switch (type) {
            case api.Curve.Cardinal:
                center.x = controls[0][0] + ((controls[1][0] - controls[0][0])/2);
                center.y = controls[0][1] + ((controls[1][1] - controls[0][1])/2);
                break;
            case api.Curve.Bezier:
                center.x = controls[0][0] + ((controls[3][0] - controls[0][0])/2);
                center.y = controls[0][1] + ((controls[3][1] - controls[0][1])/2);
                break;
            case api.Curve.BezierMatrix:
                center.x = controls[0][0] + ((controls[3][0] - controls[0][0])/2);
                center.y = controls[0][1] + ((controls[3][1] - controls[0][1])/2);
                break;
        }
        for (let i = 0; i < 4; i ++){
            controls[i][0] -= center.x;
            controls[i][0] *= scale.x;
            controls[i][0] += center.x;
            controls[i][1] -= center.y;
            controls[i][1] *= scale.y;
            controls[i][1] += center.y;
        }
    }

    //------------------------------------------------------------------
    //
    // Rotates a curve about its center.
    //    type: Cardinal, Bezier
    //    controls: appropriate to the curve type
    //    angle: radians
    //
    //------------------------------------------------------------------
    function rotateCurve(type, controls, angle){
        let center = {x: 0, y: 0};
        switch (type) {
            case api.Curve.Cardinal:
                center.x = controls[0][0] + ((controls[1][0] - controls[0][0])/2);
                center.y = controls[0][1] + ((controls[1][1] - controls[0][1])/2);
                break;
            case api.Curve.Bezier:
                center.x = controls[0][0] + ((controls[3][0] - controls[0][0])/2);
                center.y = controls[0][1] + ((controls[3][1] - controls[0][1])/2);
                break;
            case api.Curve.BezierMatrix:
                center.x = controls[0][0] + ((controls[3][0] - controls[0][0])/2);
                center.y = controls[0][1] + ((controls[3][1] - controls[0][1])/2);
                break;
        }
        for (let i = 0; i < 4; i ++){
            controls[i][0] -= center.x;
            controls[i][1] -= center.y;

            let newx = controls[i][0] * Math.cos(angle) - controls[i][1] * Math.sin(angle);
            let newy = controls[i][0] * Math.sin(angle) + controls[i][1] * Math.cos(angle);
            controls[i][0] = newx;
            controls[i][1] = newy;

            controls[i][0] += center.x;
            controls[i][1] += center.y;
        }
    }

    //
    // This is what we'll export as the rendering API
    const api = {
        clear: clear,
        drawPixel: drawPixel,
        drawLine: drawLine,
        drawCurve: drawCurve,
        drawPrimitive: drawPrimitive,
        translatePoint: translatePoint,
        translatePrimitive: translatePrimitive,
        scalePrimitive: scalePrimitive,
        rotatePrimitive: rotatePrimitive,
        translateCurve: translateCurve,
        scaleCurve: scaleCurve,
        rotateCurve: rotateCurve
    };

    Object.defineProperty(api, 'sizeX', {
        value: pixelsX,
        writable: false
    });
    Object.defineProperty(api, 'sizeY', {
        value: pixelsY,
        writable: false
    });
    Object.defineProperty(api, 'Curve', {
        value: Object.freeze({
            Hermite: 0,
            Cardinal: 1,
            Bezier: 2,
            BezierMatrix: 3
        }),
        writable: false
    });

    return api;
}(1000, 1000, false));
