/*
 * Copyright 2000-2012 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created with IntelliJ IDEA.
 * User: Natalia.Ukhorskaya
 * Date: 3/30/12
 * Time: 3:37 PM
 */

var LoginView = (function () {
    function LoginView(loginModel) {
        var model = loginModel;
        var isLoggedIn = false;


        var instance = {
            setUserName: function (name, type) {
                setUserName(name, type);
            },
            isLoggedIn: function () {
                return isLoggedIn;
            },
            logout: function () {
                isLoggedIn = false;
                $("#login").show();
                $("#logout").hide();
            },
            openLoginDialog: function(onClose){
                if(onClose != null) {
                    $(loginDialog).on("dialogclose", onClose)
                } else{
                    $(loginDialog).unbind("dialogclose")
                }
                $(loginDialog).dialog("open");
            }
        };

        var loginDialog = $("#login-dialog").dialog({
            modal: "true",
            draggable: false,
            resizable: false,
            width: 350,
            autoOpen: false,
            dialogClass: "login-dialog"
        });

        $(".login-icons").children().click(function(){
            login(this.getAttribute("login-type"));
        });

        document.getElementById("logout-button").onclick = function (event) {
            model.logout();
            event.stopPropagation();
        };

        model.getUserName();

        function login(param) {
            model.login(param);
        }

        function setUserName(userName, type) {
            if (userName != "") {
                $("#login").hide();
                $("#logout").show();

                isLoggedIn = true;
                userName = decodeURI(userName);
                userName = replaceAll(userName, "\\+", " ");

                $("#username").text(userName);
                $("#logout").find(".icon").addClass(type);
            }
        }

        return instance;
    }

    return LoginView;
})();