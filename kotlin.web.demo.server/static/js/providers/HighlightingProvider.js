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
 * Date: 3/29/12
 * Time: 1:56 PM
 */

/* EVENTS:
 get_highlighting
 write_exception
 */

var HighlightingProvider = (function () {

    function HighlightingFromServer(onSuccess, onFail) {

        var instance = {
            getHighlighting: function (project, successCallback, finallyCallback) {
                getHighlighting(project, successCallback, finallyCallback);
            }
        };

        var isLoadingHighlighting = false;

        function getHighlighting(project, successCallback, finallyCallback) {
            $.ajax({
                //runConf is unused parameter. It's added to url for useful access logs
                url: generateAjaxUrl("highlight", {runConf: project.getConfiguration()}),
                context: document.body,
                success: function (data) {
                    try {
                        isLoadingHighlighting = false;
                        if (checkDataForNull(data)) {
                            if (checkDataForException(data)) {
                                onSuccess(data);
                                successCallback(data);
                            } else {
                                onFail(data);
                            }
                        } else {
                            onFail("Incorrect data format.");
                        }
                    } catch (e) {
                        console.log(e);
                    }
                },
                dataType: "json",
                type: "POST",
                data: {project: JSON.stringify(project)},
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    try {
                        isLoadingHighlighting = false;
                        if(jqXHR.responseText != null && jqXHR.responseText != ""){
                            onFail(jqXHR.responseText);
                        } else {
                            onFail(textStatus + " : " + errorThrown);
                        }
                    } catch (e) {
                        console.log(e)
                    }
                },
                complete: function () {
                    if (finallyCallback != null) {
                        finallyCallback();
                    }
                }
            });
        }

        return instance;
    }


    return HighlightingFromServer;
})();