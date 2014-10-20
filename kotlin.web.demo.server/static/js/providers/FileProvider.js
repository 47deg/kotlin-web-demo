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

var FileProvider = (function () {

    function FileProvider() {
        var instance = {
            addNewFile: function (publicId, callback, fileName) {
                addNewFile(publicId, callback, fileName);
            },
            renameFile: function (publicId, callback, newName) {
                renameFile(publicId, callback, newName);
            },
            saveFile: function (publicId, data) {
                saveFile(publicId, data);
            },
            deleteFile: function (publicId, callback) {
                deleteFile(publicId, callback);
            },
            onNewFileAdded: function () {

            },
            onDeleteFile: function () {
            },
            onFileRenamed: function (newName) {
            },
            onFail: function (message, status) {
            }
        };

        function addNewFile(projectPublicId, callback, filename) {
            filename = addKotlinExtension(filename);
            $.ajax({
                url: generateAjaxUrl("addFile"),
                success: function (publicId) {
                    instance.onNewFileAdded(filename);
                    callback(publicId, filename);
                },
                type: "POST",
                timeout: 10000,
                data: {publicId: projectPublicId, filename: filename},
                error: function (jqXHR, textStatus, errorThrown) {
                    instance.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.save_program_fail);
                }
            })
        }

        function renameFile(publicId, callback, newName) {
            $.ajax({
                url: generateAjaxUrl("renameFile"),
                success: function () {
                    instance.onFileRenamed(newName);
                    callback(newName);
                },
                type: "POST",
                timeout: 10000,
                data: {publicId: publicId,
                    newName: newName},
                error: function (jqXHR, textStatus, errorThrown) {
                    instance.onFail(textStatus, errorThrown);
                }
            })
        }

        function deleteFile(publicId, callback) {
            $.ajax({
                url: generateAjaxUrl("deleteFile"),
                context: document.body,
                success: function () {
                    instance.onDeleteFile();
                    callback();
                },
                type: "POST",
                data: {publicId: publicId},
                timeout: 10000,
                error: function (jqXHR, textStatus, errorThrown) {
                    instance.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.load_program_fail);
                }
            });
        }

        function saveFile(publicId, data) {
            $.ajax({
                url: generateAjaxUrl("saveFile"),
                type: "POST",
                timeout: 10000,
                data: {publicId: publicId, file: JSON.stringify(data)}
//                error: function (jqXHR, textStatus, errorThrown) {
//                    instance.onFail(textStatus + " : " + errorThrown, ActionStatusMessages.save_program_fail);
//                }
            })
        }

        return instance;
    }

    return FileProvider;
})();