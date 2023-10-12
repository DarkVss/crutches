/*** AngularJS dynamic component rendering ***/
application.controller("SomeControllerName", function ($rootScope, $scope) {
    /*** Controller code ****/
})
    .component("dynamicWrapper", {
        controller : function widgetClientCtrl($scope, $compile, $element) {
            let self = this;
            self.$onInit = function () {
                renderWidget(self.name, self.payload);
            };

            function renderWidget(name, payload) {
                let template = "<" + name;

                if (payload) {
                    $scope.payload = payload;
                    template += " payload=\"payload\"";
                }

                template += "></" + name + ">";
                $element.append($compile(template)($scope));
            }
        },
        bindings   : {
            name    : "@",
            payload : "=",
        },
    })
    .component("firstComponent", {
        template   : `<div>
            <div class="text-color_error"><b>firstComponent</b> component</div>
            <pre>{{$ctrl.payload|json}}</pre>
            <dynamic-wrapper name="second-component" payload="$ctrl.payload"></dynamic-wrapper>
        </div>`,
        bindings   : {
            payload : "=",
        },
    })
    .component("secondComponent", {
        template   : `<div>
            <div class="text-color_error"><b>secondComponent</b> component</div>
            <pre>{{$ctrl.payload|json}}</pre>
        </div>`,
        bindings   : {
            payload : "=",
        },
    });
