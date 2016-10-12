
/**
 * this directive function handles the  activities under it and the necessary functions
 * for stepping between different steps
 *
 * it has the following functionality
 * onFinish{Function} --> this is called when the activities has circled through each activity
 * onStateChange{Function} --> this is called when an activity is active, returning the current index{Integer} as parameter
 * previous{Boolean | default{false}} --> this is to activate the Previous Button to switch to previous activity or step
 * next{Boolean | default{true}} --> this is to activate the Next Butotn to switch to next activity or step
 * finish{Boolean | default{true}} --> this is to activate the Finish Button when the activity or step is at the last activity
 * active {Integer | default{0}} --> this is set the current activity to begin with the page load
 *
 *
 * @return {{restrict: string, scope: {onFinish: string, onStateChange: string, previous: string, next: string, finish: string}, transclude: boolean, controller: *[], controllerAs: string, link: link, templateUrl: string}}
 */
var activities = function () {
        return{
            restrict: 'E',
            scope: {
                onFinish:'&',
                onStateChange:'&',
                previous:'=?',//previous is optional , default value is false, this allows us to show the prev button or not
                next:'=?',//default is true , but can be altered to show it or not
                finish:'=?'//default is true, but can be altered to show it or not
            },
            transclude: true,
            controller: ["$scope", function ($scope) {
                this.activities = []; // the list of activities present for this applicant
                this.current_activity = 0;// holds the current activity the applicant is currently on
                $scope.previous = ($scope.previous || false);
                $scope.next = ($scope.next || true);
                $scope.finish = ($scope.finish || true);

                /**
                 * this catches emitted activity-done process in any actvity
                 * if gotten means go to the next actvity
                 */
                $scope.$on('activity-done', function (event, data) {
                    this.activities[this.current_activity].completed = true;
                    //check if the activity is the last one is sent has done , then call our finish function
                    if((this.current_activity+1) > (activities.activities.length-1))
                        this.finish();
                    else
                        this.next();
                });

                /**
                 * this method add activity to our activities list
                 * @param activity {Object}
                 */
                this.addActivity = function(activity) {
                    this.activities.push(activity);
                };

                /**
                 * this set an activity as the active activity for the user to see
                 * using the index entered as parameter and finally call the onStateChange event function, which returns
                 * the current activity index as parameter
                 * @param index
                 */
                this.selectActivity = function(index) {
                    for (var i = 0; i < this.activities.length; i++) {
                        this.activities[i].selected = false;
                    }
                    console.log("Activities", this.activities ,"Index",  this.activities[0]);
                    this.activities[index].selected = true;
                    this.current_activity = index;
                    $scope.onStateChange({index:this.current_activity});

                };

                /**
                 * move to the next activity
                 */
                this.next = function () {
                    this.selectActivity(this.current_activity+1);
                };

                /**
                 * move to the previous activity
                 */
                this.prev = function () {
                    this.selectActivity(this.current_activity-1);
                };

                /**
                 * this functions calls the onFinish event to alert our parent controller that all the activity has been
                 * submitted
                 */
                this.finish = function () {
                    $scope.onFinish();//call this function from the parent passed to this
                };
            }],
            controllerAs: 'activities',
            link: function ($scope, $element, $attrs, $ctrl) {
                console.log("attribute", $attrs.active, "Activities", $ctrl.activities);
                $ctrl.selectActivity((Number($attrs.active)) || 0); //set which as active, minus 1 so we can use real number instead of index from the front-end
            },
            templateUrl:"views/manage_admission/activities.html"
            };
};

/**
 * each activity emit 'activity-done' , to show their process is over
 * properties
 *  title {String} --> used in setting the title of each activity
 *  completed {Boolean} --> used in notify that this activity is done
 *
 * @return {{restrict: string, scope: {title: string, completed:boolean}, require: string, transclude: boolean, template: string, link: link}}
 */
var activity = function () {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            completed: '=?'//completed is optional but default false
        },
        require: '^activities',
        transclude: true,
        template: '<div class="activity-content" ng-if="activity.selected"><div ng-transclude></div></div>',
        link:  function ($scope, $element, $attrs, $ctrl) {
            $scope.activity = {
                title: $scope.title,
                selected: false,
                completed:($scope.completed || false)
            };
            $ctrl.addActivity($scope.activity);
        }
    }
};
var module = angular.module("steps",[]);
module.directive("activities", activities);
module.directive("activity", activity);
