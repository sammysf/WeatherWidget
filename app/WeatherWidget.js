function replaceValue(listEl) {
    document.getElementById("city").value = listEl.innerHTML;
};


define([
    "dojo/_base/declare",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "app/WeatherService",
    "dojo/on",
    "dojo/dom-style",
    "dojo/_base/fx",
    "dojo/fx",
    "dijit/Dialog",
    "dojo/text!app/templates/WeatherWidget.html",

    /* These are the modules that are required by the template */
        "dijit/form/TextBox"
], function(
     declare,
    _WidgetBase, _TemplatedMixin,
    WeatherService,
    on,
    style,
    base_fx,
    fx,
    dialog,
    template

    ){

    var API_KEY = "224c7f4ac6cc0ade";

    /**
     * A dictionary to hold all of the background-image URLs
     *   If I was going to sell this product, I would download the images (making sure I had the right to),
     *   Or create/take the images myself.  Storing URLs is bad because the images might get taken down!
     */
    var backgroundURLs = {
        "clear": "http://lh3.ggpht.com/_bmjYBbtGtuA/SxgXo8MrhBI/AAAAAAAABBQ/aGw5vSs8v7s/s400/IMGQ3225.jpg",
            "sunny": "http://lh3.ggpht.com/_bmjYBbtGtuA/SxgXo8MrhBI/AAAAAAAABBQ/aGw5vSs8v7s/s400/IMGQ3225.jpg",
            "unknown": "http://lh3.ggpht.com/_bmjYBbtGtuA/SxgXo8MrhBI/AAAAAAAABBQ/aGw5vSs8v7s/s400/IMGQ3225.jpg",
        "partlycloudy": "http://www.wisdomportal.com/StanfordClouds11-4-2010/2793-HanumanCloud.jpg",
            "mostlysunny": "http://www.wisdomportal.com/StanfordClouds11-4-2010/2793-HanumanCloud.jpg",
        "mostlycloudy": "http://photos.pcpro.co.uk/blogs/wp-content/uploads/2011/02/clouds.jpg",
            "partlycloudy": "http://photos.pcpro.co.uk/blogs/wp-content/uploads/2011/02/clouds.jpg",
        "cloudy": "http://images2.layoutsparks.com/1/119805/sullen-rage-cloudy-misty.jpg",
        "rain": "http://thepost.s3.amazonaws.com/wp-content/uploads/2013/07/rain.jpg",
            "chancerain": "http://thepost.s3.amazonaws.com/wp-content/uploads/2013/07/rain.jpg",
        "tstorms": "http://upload.wikimedia.org/wikipedia/commons/4/47/Longhorndave_-_Lightning_(by).jpg",
            "chancetstorms": "http://upload.wikimedia.org/wikipedia/commons/4/47/Longhorndave_-_Lightning_(by).jpg",
        "sleet": "http://nowiknow.com/wp-content/uploads/2012/06/rain.jpeg",
            "chancesleet": "http://nowiknow.com/wp-content/uploads/2012/06/rain.jpeg",
        "flurries" : "http://soccerdad.baltiblogs.com/Feb-2-10_snowy_nite08.JPG",
            "chanceflurries" : "http://soccerdad.baltiblogs.com/Feb-2-10_snowy_nite08.JPG",
        "snow" : "http://farm5.staticflickr.com/4023/4317098210_2b4461883c_z.jpg",
            "chancesnow" : "http://farm5.staticflickr.com/4023/4317098210_2b4461883c_z.jpg",
        "hazy": "http://i64.photobucket.com/albums/h190/Morphthecat/Hazy20Sun.jpg",
        "fog": "http://travel.paintedstork.com/blog/image/fog_nandi_hills.jpg"
    };

    return declare('app/WeatherWidget', [_WidgetBase, _TemplatedMixin], {

        templateString: template,
        widget: null,
        locationInput: null,
        suggestion: null,
        temperature: null,
        forecastmodifier: null,
        forecastactual: null,
        service: null,

        postCreate: function() {
            this.inherited(arguments);
            this.service = new WeatherService(API_KEY);

            // Created local variables so they can be used in the below functions
            var weatherService = this.service;
            var widget = this.widget;
            var suggestion = this.suggestion;
            var temperature = this.temperature;
            var forecastmodifier = this.forecastmodifier;
            var forecastactual = this.forecastactual;

            var oldValue = locationInput.value;
            var oldCaretPos = locationInput.selectionEnd;
            var oldGoodValue = "";

            // Check to see if s1 is equal to the first s1.length characters of s2
            function checkSameBeg(s1, s2) {
                return (s1.toUpperCase() == s2.substring(0, s1.length).toUpperCase())
            }

            // Update the values, fade in, slide in temperature, change background
            function displayConditions(results) {
                oldGoodValue = locationInput.value;

                temperature.innerHTML = results.temp_f + "°";                

                // Fades
                style.set(temperature, "opacity", "0");
                style.set(forecastmodifier, "opacity", "0");
                style.set(forecastactual, "opacity", "0");
                base_fx.fadeIn({ node: temperature, duration: 1000 }).play();
                base_fx.fadeIn({ node: forecastmodifier, duration: 1000 }).play();
                base_fx.fadeIn({ node: forecastactual, duration: 1000 }).play();

                // Temperature slide
                var tempLeft = (400-temperature.clientWidth).toString();
                style.set(temperature, "left", (tempLeft-50).toString() + "px");
                fx.slideTo({ 
                    node: temperature, 
                    left: tempLeft, 
                    top: style.get(temperature, "top").toString(),
                    unit: "px", 
                    duration: 1000 
                }).play();

                // Conditions
                if (results.weather.trim() == "") {
                    forecastmodifier.innerHTML = "Unknown";
                    forecastactual.innerHTML = "Conditions";
                }
                else {
                    // Split forecast into two parts
                    var forecast = results.weather.split(" ");
                    var fModifier = "";
                    for (var i = 0; i < forecast.length-1; i++)
                        fModifier += forecast[i] + " ";
                    forecastmodifier.innerHTML = fModifier;
                    forecastactual.innerHTML = forecast[forecast.length-1];
                }

                // Forecastactual position/size
                if (forecastactual.clientWidth > 240) {
                    style.set(forecastactual, "font-size", "36px");
                    style.set(forecastactual, "top", "5px");
                }
                else {
                    style.set(forecastactual, "font-size", "48px");
                    style.set(forecastactual, "top", "-12px");
                } 

                // Change background
                var background = results.icon;
                if (!backgroundURLs[background]) background = "unknown";
                style.set(widget, "background-image", "url(\'" + backgroundURLs[background] + "\')");
            }      
            
            // Display error message
            function displayError(err) {
                var content = "<p>Couldn't find weather for " + locationInput.value.toUpperCase();

                // If we can give a "did you mean" list
                if (err.type == "ambiguousLocation") {
                    locations = err.locations;
                    content += "<br>Did you mean:<ul>"
                    for (var i = 0; i < locations.length; i++) {
                        content += "<li>" + locations[i].city + ", ";
                        if (locations[i].state != "")
                            content += locations[i].state;
                        else
                            content += locations[i].country_name;
                        content += "</li>";
                    }
                    content+="</ul>";
                }

                content += "</p>";

                myDialog = new dialog({
                    title: "Error",
                    content: content,
                    style: "width: 350px; height: 150px; overflow: auto"
                });

                // Replace old city
                on(myDialog, "hide", function(e) {
                    locationInput.value = oldGoodValue;
                });               

                myDialog.show();

                // Add event listeners to all list elements so a new city can be chosen
                var lis = document.getElementsByTagName("li");
                for (var i = 0; i < lis.length; i++) {
                    lis[i].addEventListener("click", function(e) {
                        oldGoodValue = this.innerHTML;
                        myDialog.hide();

                        weatherService.getConditions(oldGoodValue).then(function(results) { displayConditions(results); },
                                                                               function(err)     { displayError(err); });
                    });
                }

                // The only way I could figure out how to position it!  Gross.
                myDialog._setStyleAttr('left:' + 30 + 'px !important;');
                myDialog._setStyleAttr('top:'  + 110 + 'px !important;');
            }         
            
            /** The onChange event was only firing when I clicked outside of the textbox.
             *  Therfore, I'm using the keyup event and only sending a request to 
             *  Wunderground if the value actually changed.
             */
            on(locationInput, "keyup", function(e) {

                // If user presses the right arrow when the caret is after the last character
                // of the input, or the down arrow, then fill in the rest of the input with the suggestion
                if ((e.keycode == 40 || e.which == 40) ||
                     ((e.keycode == 39 || e.which == 39) && 
                       suggestion.value.length > locationInput.value.length &&
                       oldCaretPos == locationInput.value.length)) {
                    locationInput.value = suggestion.value;
                    return;
                }

                // Update caret position
                oldCaretPos = locationInput.selectionEnd;

                // If user presses ENTER key, search for the weather
                if ((e.keycode == 13 || e.which == 13) && locationInput.value.length > 0) {
                    locationInput.blur();
                    suggestion.value = "";

                    weatherService.getConditions(locationInput.value).then(function(results) { displayConditions(results); },
                                                                           function(err)     { displayError(err); });
                }


                var curVal = this.value;

                if (oldValue != curVal) {
                    suggestion.value = "";
                    oldValue = curVal;

                    if (curVal != "") { // Don't want to send request for an empty value
                        weatherService.queryCities(curVal).then(function(results) {
                            if (results.length > 0) {

                                    // Iterate to the first city
                                    var i = 0;
                                    while (i < results.length && results[i].type != "city") i++;

                                    // If the first city result starts with the same as letters as the input
                                    //   THIS IS IMPORTANT!  Responses don't come back in the order they were sent,
                                    //   So we have to check the current input AFTER the response comes back.
                                    if (i < results.length && checkSameBeg(locationInput.value, results[i].name))
                                        suggestion.value = results[i].name;
                                    else if (!checkSameBeg(locationInput.value, suggestion.value))
                                        suggestion.value = "";
                            }
                        });
                    }   
                    else
                        suggestion.value = "";         
                }
            });
        }

    });
});