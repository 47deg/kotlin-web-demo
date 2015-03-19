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
 * Created by Semyon.Atamas on 10/13/2014.
 */
var File = (function () {

    function File(project, content) {
        var instance = {
            toJSON: function () {
                return {
                    name: name,
                    text: text,
                    publicId: publicId
                }
            },
            save: function () {
                if (project.getType() == ProjectType.USER_PROJECT && modifiable) {
                    save()
                }
            },
            dumpToLocalStorage: function () {
                if (project.getType() != ProjectType.USER_PROJECT) {
                    dumpToLocalStorage();
                }
            },
            loadOriginal: function () {
                fileProvider.loadOriginalFile(instance, setFileData, function () {
                    window.alert("Can't find file origin, maybe it was removed by a user");
                    projectActionsView.setStatus("localFile");
                    revertible = false;
                });
            },
            onFileSaved: function () {
            },
            compareContent: function () {
                modified = !(text == originalText);
                $(modifyListeners).each(function(ind, listener){
                    listener(modified);
                });
            },
            isModified: function () {
                return modified;
            },
            onModified: function (listener) {
                modifyListeners.push(listener);
            },
            deleteThis: function () {
                if(modifiable) {
                    project.deleteFile(publicId);
                } else{
                    project.deleteUnmodifiableFile(name, publicId);
                }
                instance.onDeleted();
            },
            onDeleted: function () {

            },
            makeNotRevertible: function () {
                revertible = false;
            },
            getName: function () {
                return name;
            },
            rename: function (newName) {
                newName = addKotlinExtension(newName);
                name = newName;
                instance.onRenamed(newName);
            },
            onRenamed: function (newName) {
            },
            isModifiable: function () {
                return modifiable;
            },
            isRevertible: function () {
                return revertible;
            },
            getErrors: function () {
                return errors;
            },
            setErrors: function (newErrors) {
                errors = newErrors == null ? [] : newErrors;
            },
            getProjectType: function () {
                return project.getType();
            },
            getText: function () {
                return text;
            },
            getPublicId: function () {
                return publicId;
            },
            setText: function (newText) {
                text = newText;
                instance.compareContent();
            },
            setChangesHistory: function (history) {
                changesHistory = history;
            },
            getChangesHistory: function () {
                return changesHistory;
            },
            getProject: function () {
                return project;
            },
            getType: function(){
                return type;
            }
        };

        var name = "";
        var originalText = "";
        var text = "";
        var modifiable = true;
        var errors = [];
        var type = File.TYPE.KOTLIN_FILE;
        var publicId = "";
        var changesHistory = null;
        var modified = false;
        var revertible = true;
        var modifyListeners = [];

        function save() {
            fileProvider.saveFile(instance, function () {
                originalText = text;
                instance.compareContent();
            });
        }

        function dumpToLocalStorage() {
            localStorage.setItem(publicId, JSON.stringify({
                name: name,
                originalText: originalText,
                text: text,
                publicId: publicId,
                modifiable: modifiable,
                type: type,
                revertible: revertible
            }))
        }

        function setFileData(data) {
            if (data != null) {
                name = data.name;
                text = data.text;
                originalText = data.originalText == null ? text : data.originalText;
                modifiable = data.modifiable;
                publicId = data.publicId;
                type = data.hasOwnProperty("type") ? data.type : type;
                changesHistory = null;
                revertible = data.hasOwnProperty("revertible") ? data.revertible : true;
            }
        }

        setFileData(content);

        return instance;
    }

    File.EmptyFile = function (project, name, publicId) {
        name = addKotlinExtension(name);
        return new File(project, {
            name: name,
            text: "",
            modifiable: true,
            publicId: publicId
        });
    };

    File.fromLocalStorage = function (project, publicId) {
        return new File(project, JSON.parse(localStorage.getItem(publicId)));
    };

    File.TYPE = {
        KOTLIN_FILE: "KOTLIN_FILE",
        KOTLIN_TEST_FILE: "KOTLIN_TEST_FILE",
        JAVA_FILE: "JAVA_FILE"
    };

    return File;
})();