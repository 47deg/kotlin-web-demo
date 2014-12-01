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

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * Created by Semyon.Atamas on 11/27/2014.
 */
public class DefaultRunner {
    private static ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    private static ErrorStream errorOutputStream = new ErrorStream(outputStream);
    private static OutStream standardOutputStream = new OutStream(outputStream);

    public static void main(String[] args) {
        PrintStream defaultOutputStream = System.out;
        System.setOut(new PrintStream(errorOutputStream));
        System.setErr(new PrintStream(standardOutputStream));

        String className = args[0];
        RunOutput outputObj = new RunOutput();
        try {
            Method mainMethod = Class.forName(className).getMethod("main", String[].class);
            mainMethod.invoke(null, (Object) Arrays.copyOfRange(args, 1, args.length));
        } catch (InvocationTargetException e) {
            Throwable cause = e.getCause();
            outputObj.exception = new ExceptionDescriptor();
            outputObj.exception.message = cause.getMessage();
            outputObj.exception.stackTrace = cause.getStackTrace();
            outputObj.exception.fullName = cause.getClass().getName();
        } catch (Throwable e) {
            System.err.print("Internal error");
            e.printStackTrace();
        }

//        System.out.flush();
//        System.err.flush();
        outputObj.output = outputStream.toString();
        System.setOut(defaultOutputStream);
        try {
            System.out.print(new ObjectMapper().writeValueAsString(outputObj));
        } catch (IOException e) {
            System.out.print("{}");
        }

    }
}

class RunOutput {
    public String output = "";
    public ExceptionDescriptor exception = null;
}
