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
import junit.framework.TestSuite;
import org.jetbrains.web.demo.test.completion.CompletionTest;
import org.jetbrains.web.demo.test.examples.HighlightExamplesTest;
import org.jetbrains.web.demo.test.examples.RunExamplesTest;
import org.jetbrains.web.demo.test.highlighting.HighlightingTest;
import org.jetbrains.web.demo.test.run.RunTest;
import org.jetbrains.webdemo.*;
import org.jetbrains.webdemo.examplesLoader.ExamplesList;
import org.jetbrains.webdemo.help.HelpLoader;
import org.jetbrains.webdemo.server.ServerSettings;

/**
 * @author Natalia.Ukhorskaya
 */

public class TestAll extends TestCase {

    public static TestSuite suite() {
        TestSuite suite = new TestSuite(
                HighlightingTest.class,
                HighlightExamplesTest.class,
                CompletionTest.class,
                HighlightExamplesTest.class,
                RunExamplesTest.class,
                RunTest.class
        );
//        suite.addTest(testDslExample.namespace.getSuite());
        return suite;
    }

}
