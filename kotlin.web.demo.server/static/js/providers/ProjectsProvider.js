/*
 * Copyright 2000-2014 JetBrains s.r.o.
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


var ProjectProvider = (function () {

    function ProjectsProvider(project) {
        var instance = {
            loadExample: function (url) {
                loadExample(url);
            },
            loadProject: function (url) {
                loadProject(url);
            },
            deleteProject: function (url) {
                deleteProject(url);
            },
            deleteFile: function (url) {
                deleteFile(url);
            },
            addNewFile: function (projectName, fileName) {
                addNewFile(projectName, fileName);
            },
            forkProject: function (content, url) {
                forkProject(content, url)
            },
            saveFile: function (url, data) {
                saveFile(url, data);
            },
            saveProject: function (content) {
                saveProject(content);
            },
            renameFile: function (url, newName) {
                renameFile(url, newName)
            },
            onExampleLoaded: function (data) {
            },
            onProjectLoaded: function (data) {

            },
            onDeleteProject: function () {

            },
            onDeleteFile: function (url) {

            },
            onProjectFork: function () {

            },
            onFileRenamed: function () {

            },
            onProjectSave: function () {

            }
        };

        function loadExample(url) {
            $.ajax({
                url: generateAjaxUrl("loadExample", url),
                context: document.body,
                success: function (data) {
                    if (checkDataForNull(data)) {
                        if (checkDataForException(data)) {
                            instance.onExampleLoaded(data);
                        } else {
                            project.onFail(data, ActionStatusMessages.load_example_fail);
                        }
                    } else {
                        project.onFail("Incorrect data format.", ActionStatusMessages.load_example_fail);
                    }
                },
                dataType: "json",
                type: "GET",
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    project.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.load_example_fail);
                }
            });
        }

        function loadProject(url) {
            $.ajax({
                url: generateAjaxUrl("loadProject", url),
                context: document.body,
                success: function (data) {
                    if (checkDataForNull(data)) {
                        if (checkDataForException(data)) {
                            instance.onProjectLoaded(data);
                        } else {
                            project.onFail(data, ActionStatusMessages.load_program_fail);
                        }
                    } else {
                        project.onFail("Incorrect data format.", ActionStatusMessages.load_program_fail);
                    }
                },
                dataType: "json",
                type: "GET",
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    project.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.load_program_fail);
                }
            });
        }


        function forkProject(content, name) {
            $.ajax({
                url: generateAjaxUrl("addProject", name),
                success: function () {
                    instance.onProjectFork(name);
                },
                type: "POST",
                timeout: 10000,
                data: {content: JSON.stringify(content)},
                error: function (jqXHR, textStatus, errorThrown) {
                    instance.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.save_program_fail);
                }
            })
        }

        function addNewFile(filename) {
            if (!filename.endsWith(".kt")) {
                filename = filename + ".kt";
            }
            $.ajax({
                url: generateAjaxUrl("addFile", project.getUrl() + "&filename=" + filename),
                success: function () {
                    project.addNewFile(filename);
                },
                type: "POST",
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    project.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.save_program_fail);
                }
            })
        }

        function deleteProject(url) {
            $.ajax({
                url: generateAjaxUrl("deleteProject", url),
                context: document.body,
                success: function () {
                    instance.onDeleteProject(url);
                },
                type: "POST",
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    project.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.load_program_fail);
                }
            });
        }

        function deleteFile(url) {
            $.ajax({
                url: generateAjaxUrl("deleteFile", url),
                context: document.body,
                success: function () {
                    instance.onDeleteFile(url);
                },
                type: "POST",
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    project.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.load_program_fail);
                }
            });
        }

        function saveFile(url, data) {
            $.ajax({
                url: generateAjaxUrl("saveFile", url),
                type: "POST",
                timeout: 10000,
                data: {file: JSON.stringify(data)},
                error: function (jqXHR, textStatus, errorThrown) {
                    instance.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.save_program_fail);
                }
            })
        }

        function saveProject(content) {
            $.ajax({
                url: generateAjaxUrl("saveProject"),
                type: "POST",
                success: instance.onProjectSave,
                timeout: 10000,
                data: {project: JSON.stringify(content)},
                error: function (jqXHR, textStatus, errorThrown) {
                    instance.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.save_program_fail);
                }
            })
        }

        function renameFile(url, newName) {
            $.ajax({
                url: generateAjaxUrl("renameFile", url),
                success: function(data){instance.onFileRenamed(url, newName)},
                type: "POST",
                timeout: 10000,
                data: {newName: newName}
            })
        }

        return instance;
    }

    return ProjectsProvider;
})();