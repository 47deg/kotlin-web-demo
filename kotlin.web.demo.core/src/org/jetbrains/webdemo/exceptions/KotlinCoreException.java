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

package org.jetbrains.webdemo.exceptions;

import org.jetbrains.webdemo.ResponseUtils;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Created by IntelliJ IDEA.
 * User: Natalia.Ukhorskaya
 * Date: 11/24/11
 * Time: 9:54 AM
 */

public class KotlinCoreException extends RuntimeException {
    private final Throwable e;

    public KotlinCoreException(Throwable e) {
        this.e = e;
    }

    @Override
    public String getMessage() {
        return e.getMessage();
    }

    @Override
    public Throwable fillInStackTrace() {
        return null;
    }

    public String getStackTraceString() {
        StringWriter stringWriter = new StringWriter();
        e.printStackTrace(new PrintWriter(stringWriter));
        String stackTrace = stringWriter.toString().replaceAll("\t", "");
        stackTrace = stackTrace.replaceAll(System.getProperty("line.separator"), ResponseUtils.addNewLine());
        return stackTrace;
    }
}
