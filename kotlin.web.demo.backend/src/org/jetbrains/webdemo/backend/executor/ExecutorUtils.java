/*
 * Copyright 2000-2016 JetBrains s.r.o.
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

package org.jetbrains.webdemo.backend.executor;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.jetbrains.webdemo.CommonSettings;
import org.jetbrains.webdemo.ErrorWriter;
import org.jetbrains.webdemo.backend.BackendSettings;
import org.jetbrains.webdemo.backend.executor.result.ExecutionResult;
import org.jetbrains.webdemo.backend.executor.result.JavaExecutionResult;
import org.jetbrains.webdemo.backend.executor.result.JunitExecutionResult;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class ExecutorUtils {
    private static List<Path> jarFiles = Arrays.asList(
            Paths.get(BackendSettings.CLASS_PATH, "Executors.jar"),
            Paths.get(BackendSettings.LIBS_DIR, "jackson-databind.jar"),
            Paths.get(BackendSettings.LIBS_DIR, "jackson-core.jar"),
            Paths.get(BackendSettings.LIBS_DIR, "jackson-annotations.jar")
    );
    private static Path junit = Paths.get(BackendSettings.LIBS_DIR, "junit.jar");

    public static ExecutionResult executeCompiledFiles(
            Map<String, byte[]> files,
            String mainClass,
            List<Path> kotlinRuntimeJars,
            Path kotlinCompilerJar,
            String arguments,
            boolean isJunit
    ) throws Exception {
        Path codeDirectory = null;
        try {
            codeDirectory = storeFilesInTemporaryDirectory(files);
            JavaExecutorBuilder executorBuilder = new JavaExecutorBuilder()
                    .enableAssertions()
                    .setMemoryLimit(32)
                    .enableSecurityManager()
                    .setPolicyFile(Paths.get(CommonSettings.WEBAPP_ROOT_DIRECTORY, "executors.policy"))
                    .addToClasspath(kotlinRuntimeJars)
                    .addToClasspath(jarFiles)
                    .addToClasspath(codeDirectory);
            if (isJunit) {
                executorBuilder.addToClasspath(junit);
                executorBuilder.addToClasspath(kotlinCompilerJar);
                executorBuilder.setMainClass("org.jetbrains.webdemo.executors.JunitExecutor");
                executorBuilder.addArgument(codeDirectory.toString());
            } else {
                executorBuilder.setMainClass("org.jetbrains.webdemo.executors.JavaExecutor");
                executorBuilder.addArgument(mainClass);
            }
            executorBuilder.addArgument(arguments);

            ProgramOutput output = executorBuilder.build().execute();
            return parseOutput(output.getStandardOutput(), isJunit);
        } finally {
            try {
                if (codeDirectory != null) {
                    Files.walkFileTree(codeDirectory, new FileVisitor<Path>() {
                        @Override
                        public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                            return FileVisitResult.CONTINUE;
                        }

                        @Override
                        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                            Files.delete(file);
                            return FileVisitResult.CONTINUE;
                        }

                        @Override
                        public FileVisitResult visitFileFailed(Path file, IOException exc) throws IOException {
                            return FileVisitResult.TERMINATE;
                        }

                        @Override
                        public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                            Files.delete(dir);
                            return FileVisitResult.CONTINUE;
                        }
                    });
                }
            } catch (IOException e) {
                ErrorWriter.getInstance().writeExceptionToExceptionAnalyzer(e, "Can't delete code directory");
            }
        }
    }

    private static ExecutionResult parseOutput(String standardOutput, boolean isJunit) {
        try {
            if(!isJunit) {
                return new ObjectMapper().readValue(standardOutput, JavaExecutionResult.class);
            } else {
                return new ObjectMapper().readValue(standardOutput, JunitExecutionResult.class);
            }
        } catch (IOException e) {
            ErrorWriter.ERROR_WRITER.writeExceptionToExceptionAnalyzer(e, "Can't parse project run output");
            return null;
        }
    }

    private static Path storeFilesInTemporaryDirectory(Map<String, byte[]> files) throws IOException {
        Path outputDir = Paths.get(BackendSettings.OUTPUT_DIRECTORY, "tmp", String.valueOf(new Random().nextInt()));
        for (String fileName : files.keySet()) {
            Path filePath = outputDir.resolve(fileName);
            filePath.getParent().toFile().mkdirs();
            Files.write(filePath, files.get(fileName));
        }
        return outputDir;
    }
}
