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

package org.jetbrains.webdemo.examplesLoader;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.webdemo.server.ApplicationSettings;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Project {
    /**
     * This field is needed when user makes copy of example. Url of this example will be stored here.
     */
    public String originUrl;
    @NotNull
    public String name;
    @NotNull
    public String parent;
    @NotNull
    public String args = "";
    @NotNull
    public String confType = "java";
    public boolean isLocalVersion = false;

    @NotNull
    public String help = "";
    @NotNull
    public String[] testClasses;
    @NotNull
    public List<ProjectFile> files = new ArrayList<>();


    public Project(){

    }

    /**
     * This constructor is used to get examples from server.
     * @param parent - Name of parent folder
     * @param exampleFolderName - Name of example folder
     * @throws IOException - if example folder has no manifest file, if example files do not exists, or some other problem with IO.
     */
    public Project(@NotNull String parent, @NotNull String exampleFolderName) throws IOException {
        originUrl = parent.replaceAll(" ", "_") + "&name=" + exampleFolderName.replaceAll(" ", "_");
        ObjectMapper objectMapper = new ObjectMapper();
        this.parent = parent;
        String exampleFolderPath = ApplicationSettings.EXAMPLES_DIRECTORY + File.separator + parent + File.separator + exampleFolderName + File.separator;
        File manifest = new File(exampleFolderPath + "manifest.json");
        JsonNode objectNode = objectMapper.readTree(manifest);

        name = objectNode.get("name").textValue();
        args = objectNode.get("args").textValue();
        confType = objectNode.get("confType").textValue();
        isLocalVersion = true;
        help = objectNode.get("help").textValue();
        if(confType.equals("junit")) {
            testClasses = objectMapper.readValue(objectNode.get("testClasses").traverse(), String[].class);
        }
        Iterator<JsonNode> it = objectNode.get("files").elements();
        while(it.hasNext()){
            JsonNode fileDescriptor = it.next();

            String fileName = fileDescriptor.get("filename").textValue();
            boolean modifiable = fileDescriptor.get("modifiable").asBoolean();
            String fileContent;
            if(fileName != null){
                Path path = Paths.get(exampleFolderPath + File.separator + fileName);
                fileContent = new String(Files.readAllBytes(path)).replaceAll("\r\n", "\n");
            } else{
                fileContent = fileDescriptor.get("content").asText();
            }
            ProjectFile file = new ProjectFile(fileName, fileContent, modifiable);
            files.add(file);
        }
    }
}
