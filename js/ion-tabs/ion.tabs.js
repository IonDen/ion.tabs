// Ion.Tabs
// version 1.0.0 Build: 12
// © 2013 Denis Ineshin | IonDen.com
//
// Project page:    http://ionden.com/a/plugins/ion.tabs/en.html
// GitHub page:     https://github.com/IonDen/ion.tabs
//
// Released under MIT licence:
// http://ionden.com/a/plugins/licence-en.html
// =====================================================================================================================

(function ($, document, window, location) {

    if($.ionTabs) {
        return;
    }



    var settings = {},
        tabs = {},
        url = {},
        urlString,
        i,
        temp,

        $window = $(window);



    // Local Storage
    var storage = {
        init: function(){
            this.hasLS = true;
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch(e) {
                this.hasLS = false;
            }
        },
        save: function(param, key){
            if(!this.hasLS) {
                return;
            }
            if(typeof key === "object") {
                key = JSON.stringify(key);
            }
            try {
                localStorage.setItem(param, key);
            } catch (e) {
                if (e === "QUOTA_EXCEEDED_ERR") {
                    localStorage.clear();
                }
            }
        },
        load: function(param){
            if(!this.hasLS) {
                return null;
            }
            return localStorage.getItem(param);
        },
        del: function(param){
            if(!this.hasLS) {
                return;
            }
            localStorage.removeItem(param);
        }
    };
    storage.init();




    // Url
    var getUrl = function(){
        if(settings.type === "hash") {
            urlString = location.hash;
        }
        if(settings.type === "storage") {
            urlString = storage.load(location.hostname + "__ionTabsPosition");
        }

        if(urlString) {
            urlString = urlString.split("|");

            if(urlString.length > 1) {
                for(i = 1; i < urlString.length; i++) {
                    temp = urlString[i].split(":");
                    url[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
                }
            }

            urlString = "";
        }
    };




    // Tabs engine
    var Tabs = function(container) {
        this.container = container;
    };
    Tabs.prototype = {
        init: function(){
            var $container = this.container,
                $tabs = $container.find(".ionTabs__tab"),
                $items = $container.find(".ionTabs__item"),
                $preloader = $container.find(".ionTabs__preloader"),
                $this,

                name = $container.data("name"),
                id;

            $tabs.each(function(){
                $this = $(this);
                id = "Button__" + name + "__" + $this.data("target");
                $this.prop("id", id);
            });

            $items.each(function(){
                $this = $(this);
                id = "Tab__" + name + "__" + $this.data("name");
                $this.prop("id", id);
            });


            $tabs.on("click.ionTabs", function(e){
                e.preventDefault();
                showPreloader();
                setTab($(this).data("target"));
            });


            var setTab = function(target){
                target = decodeURIComponent(target);
                id = "#Button__" + name + "__" + target;
                $(id).addClass("ionTabs__tab_state_active").siblings().removeClass("ionTabs__tab_state_active");

                id = "#Tab__" + name + "__" + target;
                $(id).addClass("ionTabs__item_state_active").siblings().removeClass("ionTabs__item_state_active");

                hidePreloader();
                setUrl(target);


                // trigger event and execute callback
                $window.trigger("ionTabsChange", {
                    group: name,
                    tab: target,
                    tabId: id
                });

                if(typeof settings.onChange === "function"){
                    settings.onChange({
                        group: name,
                        tab: target,
                        tabId: id
                    });
                }
            };

            var setUrl = function(target){
                url[name] = target;
                urlString = "tabs";

                for(i in url) {
                    if(url.hasOwnProperty(i)) {
                        urlString += "|" + encodeURIComponent(i) + ":" + encodeURIComponent(url[i]);
                    }
                }

                if(settings.type === "hash") {
                    location.hash = urlString;
                }
                if(settings.type === "storage") {
                    storage.save(location.hostname + "__ionTabsPosition", urlString);
                }
            };

            var showPreloader = function(){
                $preloader[0].style.display = "block";
            };

            var hidePreloader = function(){
                $preloader[0].style.display = "none";
            };


            // Set tabs at start
            if(url[name]) {
                setTab(url[name]);
            } else {
                setTab($tabs.eq(0).data("target"));
            }

            // Public
            this.setTab = function(name) {
                setTab(name);
            };
        }
    };



    // Plugin methods
    $.ionTabs = function(selector, options){
        if(!selector) {
            return;
        }

        settings = $.extend({
            type: "hash",
            onChange: null
        }, options);

        getUrl();

        $(selector).each(function(){
            var name = encodeURIComponent($(this).data("name"));
            tabs[name] = new Tabs($(this));
            tabs[name].init();
        });
    };



    // Plugin Public methods
    $.ionTabs.setTab = function(group, name) {
        tabs[group].setTab(name);
    };

}(jQuery, document, window, location));