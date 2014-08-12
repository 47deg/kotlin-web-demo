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
 * Created by Semyon.Atamas on 8/12/2014.
 */
import org.junit.runner.Description;
import org.junit.runner.JUnitCore;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;


public class JunitRunner {

    public static void main(String[] args) {
        JUnitCore jUnitCore = new JUnitCore();
        jUnitCore.addListener(new MyRunListener());
        for(String className : args){
            try {
                jUnitCore.run(Class.forName(className));
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }
    }


}


class MyRunListener extends RunListener {

    @Override
    public void testStarted(Description description) {
        System.out.println("@" + description.getDisplayName() + "@");
    }

    @Override
    public void testFailure(Failure failure) {
        System.out.println(failure.getMessage());
    }

    @Override
    public void testFinished(Description description) {
        System.out.println("@finished " + description.getDisplayName() + "@");
    }
}