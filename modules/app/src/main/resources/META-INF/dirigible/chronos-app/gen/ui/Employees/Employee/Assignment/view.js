const viewData = {
    id: "Assignment",
    label: "Assignment",
    factory: "frame",
    region: "bottom",
    link: "/services/v4/web/chronos-app/gen/ui/Employees/Employee/Assignment/index.html",
};

if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}
