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

package org.jetbrains.webdemo.kotlin.impl;

import org.jetbrains.kotlin.psi.KtFile;
import org.jetbrains.webdemo.kotlin.KotlinWrapper;
import org.jetbrains.webdemo.kotlin.KotlinWrappersManager;
import org.jetbrains.webdemo.kotlin.datastructures.*;
import org.jetbrains.webdemo.kotlin.impl.analyzer.ErrorAnalyzer;
import org.jetbrains.webdemo.kotlin.impl.compiler.KotlinCompilerWrapper;
import org.jetbrains.webdemo.kotlin.impl.completion.CompletionProvider;
import org.jetbrains.webdemo.kotlin.impl.converter.WebDemoJavaToKotlinConverter;
import org.jetbrains.webdemo.kotlin.impl.environment.EnvironmentManager;
import org.jetbrains.webdemo.kotlin.impl.translator.WebDemoTranslatorFacade;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class KotlinWrapperImpl implements KotlinWrapper {
    private Path jarsFolder;
    private String kotlinVersion;

    @Override
    public void init(List<Path> javaLibraries, String kotlinVersion) {
        this.kotlinVersion = kotlinVersion;
        jarsFolder = KotlinWrappersManager.getWrappersDir().resolve(kotlinVersion).resolve("kotlin");
        WrapperSettings.JS_LIB_ROOT = KotlinWrappersManager.getWrappersDir().resolve(kotlinVersion).resolve("js");
        List<Path> libraries = getKotlinRuntimeLibraries();
        libraries.addAll(javaLibraries);
        EnvironmentManager.init(libraries);
    }

    public String translateJavaToKotlin(String javaCode) {
        return WebDemoJavaToKotlinConverter.getResult(javaCode);
    }

    @Override
    public Map<String, List<ErrorDescriptor>> getErrors(Map<String, String> files, boolean isJs) {
        List<KtFile> psiFiles = createPsiFiles(files);
        ErrorAnalyzer analyzer = new ErrorAnalyzer(psiFiles, EnvironmentManager.getEnvironment().getProject());
        return analyzer.getAllErrors(isJs);
    }

    @Override
    public TranslationResult compileKotlinToJS(Map<String, String> files, String[] args) {
        List<KtFile> ktFiles = createPsiFiles(files);
        return WebDemoTranslatorFacade.translateProjectWithCallToMain(ktFiles, args);
    }

    @Override
    public List<CompletionVariant> getCompletionVariants(
            Map<String, String> projectFiles, String filename, int line, int ch, boolean isJs) {
        List<KtFile> files = createPsiFiles(projectFiles);
        CompletionProvider completionProvider = new CompletionProvider(files, filename, line, ch);
        return completionProvider.getResult(isJs);
    }

    @Override
    public CompilationResult compileCorrectFiles(Map<String, String> projectFiles) {
        List<KtFile> files = createPsiFiles(projectFiles);
        KotlinCompilerWrapper compilerWrapper = new KotlinCompilerWrapper();
        return compilerWrapper.compile(files, EnvironmentManager.getEnvironment().getProject());
    }

    @Override
    public List<Path> getKotlinRuntimeLibraries() {
        List<Path> libraries = new ArrayList<>();
        libraries.add(jarsFolder.resolve("kotlin-runtime-" + kotlinVersion + ".jar"));
        libraries.add(jarsFolder.resolve("kotlin-reflect-" + kotlinVersion + ".jar"));
        libraries.add(jarsFolder.resolve("kotlin-test-" + kotlinVersion + ".jar"));
        return libraries;
    }

    @Override
    public MethodPositions getMethodPositions(byte[] classFile, String classFileName) {
        return MethodsFinder.readMethodPositions(classFile, classFileName);
    }

    @Override
    public Path getKotlinCompilerJar() {
        return jarsFolder.resolve("kotlin-compiler.jar");
    }

    private List<KtFile> createPsiFiles(Map<String, String> files) {
        List<KtFile> result = new ArrayList<>();
        for (String fileName : files.keySet()) {
            result.add(JetPsiFactoryUtil.createFile(EnvironmentManager.getEnvironment().getProject(), fileName, files.get(fileName)));
        }
        return result;
    }
}
