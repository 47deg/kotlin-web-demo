/*
 * Copyright 2000-2015 JetBrains s.r.o.
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
 * Created by Semyon.Atamas on 8/26/2014.
 */


var HeadersProvider = (function () {

    function HeadersProvider() {

        var instance = {
            getAllHeaders: function (/*Function*/callback) {
                getAllHeaders(callback);
            },
            getHeaderByFilePublicId: function (publicId, project_id, /*Function*/callback) {
                getHeaderByFilePublicId(publicId, project_id, callback);
            },
            onHeadersLoaded: function () {

            },
            onProjectHeaderLoaded: function (data) {

            },
            onProjectHeaderNotFound: function (data) {

            },
            onFail: function () {
            }
        };

        function addHeaderInfo(folder) {
            var folderName = folder.name;
            var projects = [];

            if (folderName != "My programs") {
                $(folder.examples).each(function (ind, exampleName) {
                    projects.push({
                        name: exampleName,
                        type: ProjectType.EXAMPLE,
                        publicId: createExampleId(exampleName, folderName)
                    });
                });
            } else {
                $(folder.projects).each(function (ind, project) {
                    projects.push({
                        name: project.name,
                        type: ProjectType.USER_PROJECT,
                        publicId: project.publicId
                    });
                });
            }

            return {
                name: folderName,
                childFolders: $.map(folder.childFolders, addHeaderInfo),
                projects: projects
            };
        }

        function getAllHeaders(callback) {
            blockContent();
            $.ajax({
                url: generateAjaxUrl("loadHeaders"),
                context: document.body,
                success: function (data) {
                    try {
                        if (checkDataForNull(data)) {
                            if (checkDataForException(data)) {
                                var folders = $.map(data, addHeaderInfo);

                                var publicLinks;
                                if (localStorage.getItem("publicLinks") != null) {
                                    publicLinks = JSON.parse(localStorage.getItem("publicLinks")).sort(function (a, b) {
                                        return a.timeStamp - b.timeStamp;
                                    });
                                } else {
                                    publicLinks = "";
                                }

                                folders.push({
                                    name: "Public links",
                                    childFolders: [],
                                    projects: publicLinks
                                });

                                callback(folders);
                                instance.onHeadersLoaded();
                            } else {
                                instance.onFail(data, ActionStatusMessages.load_headers_fail);
                            }
                        } else {
                            instance.onFail("Incorrect data format.", ActionStatusMessages.load_headers_fail);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                },
                dataType: "json",
                type: "GET",
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    try {
                        instance.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.load_headers_fail);
                    } catch (e) {
                        console.log(e)
                    }
                },
                complete: unBlockContent
            });
        }

        function getHeaderByFilePublicId(publicId, project_id, /*Function*/callback) {
            blockContent();
            $.ajax({
                url: generateAjaxUrl("loadProjectInfoByFileId"),
                success: function (data) {
                    try {
                        callback(data);
                        instance.onProjectHeaderLoaded(data);
                    } catch (e) {
                        console.log(e)
                    }
                },
                type: "GET",
                timeout: 10000,
                dataType: "json",
                data: {
                    publicId: publicId,
                    project_id: project_id
                },
                statusCode: {
                    404: instance.onProjectHeaderNotFound
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    try {
                        instance.onFail(textStatus + " : " + errorThrown);
                    } catch (e) {
                        console.log(e)
                    }
                },
                complete: unBlockContent
            })
        }

        return instance;
    }

    return HeadersProvider;
})();