'use strict';
(function() {

    var objects = [],
        plane;

    var container;
    var camera, controls, scene, projector, renderer;

    var mouse = new THREE.Vector2(),
        offset = new THREE.Vector3(),
        INTERSECTED, SELECTED;

    var canvasWidth = 550,
        canvasHeight = 400;

    var objectName = document.getElementById('object-name'),
        viewDiv = document.getElementById('canvas');

    init();
    animate();


    function addMesh(drawable) {
        // body...
    }

    function addRandomizedMesh(drawableGeometry, objName) {
        var geometry;
        if (drawableGeometry == 'sphere') {
            geometry = new THREE.SphereGeometry(20);
        } else {
            geometry = new THREE.BoxGeometry(40, 40, 40);
        }

        var color = Math.random() * 0xffffff;

        var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            color: color
        }));

        object.name = objName || "Object " + color;

        object.material.ambient = object.material.color;

        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600 - 300;
        object.position.z = Math.random() * 800 - 400;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.castShadow = true;
        object.receiveShadow = true;

        scene.add(object);

        objects.push(object);
        return object;
    }


    function init() {

        container = viewDiv;
        // container = document.createElement('div');
        // document.body.appendChild(container);


        camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 1, 10000);
        camera.position.z = 1000;



        scene = new THREE.Scene();

        scene.add(new THREE.AmbientLight(0x505050));

        var light = new THREE.SpotLight(0xffffff, 1.5);
        light.position.set(0, 500, 2000);
        light.castShadow = true;

        light.shadowCameraNear = 200;
        light.shadowCameraFar = camera.far;
        light.shadowCameraFov = 50;

        light.shadowBias = -0.00022;
        light.shadowDarkness = 0.5;

        light.shadowMapWidth = 2048;
        light.shadowMapHeight = 2048;

        scene.add(light);

        // var drawableGeometry = '1';

        // for (var i = 0; i < 10; i++) {
        //     addRandomizedMesh(drawableGeometry);
        // }

        plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 8, 8), new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.25,
            transparent: true,
            wireframe: true
        }));
        plane.visible = false;
        scene.add(plane);

        projector = new THREE.Projector();

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColor(0xf0f0f0);
        renderer.setSize(canvasWidth, canvasHeight);
        renderer.sortObjects = false;

        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFShadowMap;

        container.appendChild(renderer.domElement);

        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;


        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

        // window.addEventListener('resize', onWindowResize, false);

    };

    // function onWindowResize() {

    //     camera.aspect = window.innerWidth / window.innerHeight;
    //     camera.updateProjectionMatrix();

    //     renderer.setSize(window.innerWidth, window.innerHeight);

    // };

    function onDocumentMouseMove(event) {

        event.preventDefault();
        mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - renderer.domElement.offsetTop) / container.clientHeight) * 2 + 1;

        // Basically, this is translating from screen coordinates that start at (0,0) at the top left through to 
        // (window.innerWidth,window.innerHeight) at the bottom right, to the cartesian coordinates with center (0,0) 
        // and ranging from (-1,-1) to (1,1)

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        projector.unprojectVector(vector, camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());


        if (SELECTED) {

            var intersects = raycaster.intersectObject(plane);
            SELECTED.position.copy(intersects[0].point.sub(offset));
            return;

        }


        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                plane.position.copy(INTERSECTED.position);
                plane.lookAt(camera.position);
            }
            container.style.cursor = 'pointer';
        } else {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            INTERSECTED = null;
            container.style.cursor = 'auto';
        }
    };

    function onDocumentMouseDown(event) {
        event.preventDefault();
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        projector.unprojectVector(vector, camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            controls.enabled = false;
            SELECTED = intersects[0].object;

            console.log(SELECTED);
            objectName.innerHTML = SELECTED.name;

            var intersects = raycaster.intersectObject(plane);
            offset.copy(intersects[0].point).sub(plane.position);
            container.style.cursor = 'move';
        }
    };

    function onDocumentMouseUp(event) {
        event.preventDefault();
        controls.enabled = true;
        if (INTERSECTED) {
            plane.position.copy(INTERSECTED.position);
            SELECTED = null;
        }
        container.style.cursor = 'auto';
    };

    //

    function animate() {
        requestAnimationFrame(animate);
        render();
    };

    function render() {
        controls.update();
        renderer.render(scene, camera);
    };

    var Drawable = Backbone.Model.extend({
        defaults: {
            id: null,
            uuid: null,
            name: 'untitled',
            color: '0x000000',
            position: {
                x: null,
                y: null,
                z: null,
            },
            rotation: {
                x: null,
                y: null,
                z: null,
            },
            scale: {
                x: null,
                y: null,
                z: null,
            }
        }
    });

    var DrawableList = Backbone.Collection.extend({
        model: Drawable,
        // Save all of the todo items under the `"mujin-drawables"` namespace.
        localStorage: new Backbone.LocalStorage("mujin-drawables")
    });

    var Drawables = new DrawableList;


    // Todo Drawable View
    // --------------

    // The DOM element for a drawable item...

    var DrawableView = Backbone.View.extend({
        tagName: 'tr',

        template: _.template($('#drawable-template').html()),
        events: {
            'click a.destroy': 'clear'
        },

        // The DrawableView listens for changes to its model, re-rendering. 
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        // Remove the item, destroy the model.
        clear: function() {
            if (confirm("Are you sure you want to delete this object?")) {
                scene.remove(scene.getObjectByName(this.model.get('name')));
                this.model.destroy();
            } else {
                return;
            }

        }

    });

    // var drawableView = new DrawableView({
    //     model: drawable
    // });

    // drawableView.render();
    // $('#drawables-table').html(drawableView.el);

    var AppView = Backbone.View.extend({

        el: $("#mujinapp"),

        events: {
            "click #drawable-add-random": "createRandomItem",
        },

        initialize: function() {
            this.listenTo(Drawables, 'add', this.addOne);
            this.listenTo(Drawables, 'reset', this.addAll);
            // this.listenTo(Drawables, 'all', this.render);
            Drawables.fetch();

            this.drawableName = this.$('#drawable-name');
            this.drawableGeometry = this.$('#drawable-geometry');
        },

        render: function() {
            // init();
            // animate();
        },
        addOne: function(drawable) {
            var view = new DrawableView({
                model: drawable
            });

            this.$("#drawables-table").append(view.render().el);


        },
        addAll: function() {
            // Adds all meshes from localStorage to scene
            Drawables.each(this.addOne, this);
        },
        createItem: function() {
            // addMesh(drawable);
            Drawables.create({
                name: this.drawableName.val()
            });
            this.drawableName.val('');
            console.log(Drawables);
        },
        createRandomItem: function() {

            if (!this.drawableName.val()) {
                alert('Enter a name');
                return;
            }


            addRandomizedMesh(this.drawableGeometry.val(), this.drawableName.val());
            Drawables.create({
                name: this.drawableName.val()
            });
            this.drawableName.val('');
            console.log(Drawables);
        }
    });
    var App = new AppView;

})();