package org.jetbrains.webdemo.test;
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

import junit.framework.TestCase;
import org.jetbrains.webdemo.*;
import org.jetbrains.webdemo.examplesLoader.ExamplesList;
import org.jetbrains.webdemo.help.HelpLoader;
import org.jetbrains.webdemo.server.ApplicationSettings;
import org.jetbrains.webdemo.session.SessionInfo;
import org.jetbrains.webdemo.translator.WebDemoConfigServer;
import org.jetbrains.webdemo.translator.WebDemoTranslatorFacade;

import java.io.File;

/**
 * @author Natalia.Ukhorskaya
 */

public class BaseTest extends TestCase {

    protected SessionInfo sessionInfo = new SessionInfo("test");

    @Override
    public void setUp() throws Exception {
        super.setUp();
        System.setProperty("kotlin.running.in.server.mode", "true");
        System.setProperty("java.awt.headless", "true");

        ErrorWriter.ERROR_WRITER = ErrorWriterOnServer.getInstance();
        Initializer.INITIALIZER = ServerInitializer.getInstance();

//        ApplicationSettings.JAVA_HOME = "c:\\Program Files\\Java\\jdk1.6.0_30\\";

        ApplicationSettings.WEBAPP_ROOT_DIRECTORY = "kotlin.web.demo.core/resources";

        ApplicationSettings.EXAMPLES_DIRECTORY = "examples/";
        boolean initEnvironment = ServerInitializer.getInstance().initJavaCoreEnvironment();
        assertEquals("Initialisation of java core environment failed, server didn't start.",
                true, initEnvironment);

        ApplicationSettings.JAVA_EXECUTE = ApplicationSettings.JAVA_HOME + File.separator + "bin" + File.separator + "java";
        System.out.println("setUp: JAVA_HOME=" + ApplicationSettings.JAVA_EXECUTE);

        WebDemoTranslatorFacade.LOAD_JS_LIBRARY_CONFIG = new WebDemoConfigServer(Initializer.INITIALIZER.getEnvironment().getProject());
        ExamplesList.getInstance();
        HelpLoader.getInstance();
        Statistics.getInstance();
    }
}
