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
 * Created by Semyon.Atamas on 8/13/2014.
 */


var JUnitView = (function () {
    var statistic;
    var statisticText;
    var navTree;

    function JUnitView(element, tabs) {

        var instance = {
            setOutput: function (data) {
                element.innerHTML = "";

                tabs.tabs("option", "active", 1);
                navTree = document.createElement("div");
                navTree.id = "test-tree-div";
                element.appendChild(navTree);
                statistic = document.createElement("div");
                statistic.id = "unit-test-statistic";

                statisticText = document.createElement("span");
                statistic.appendChild(statisticText);

                var consoleElement = document.createElement("div");
                consoleElement.className = "consoleOutput";
                consoleOutputView.writeTo(consoleElement);

                var wrapper = document.createElement("div");
                wrapper.id = "test-wrapper";
                element.appendChild(wrapper);
                wrapper.appendChild(statistic);
                wrapper.appendChild(consoleElement);

                for (var i = 0; i < data.length; i++) {
                    if (data[i].type == "out") {
                        if (data[i].testResults.length != 0) {
                            createStatistics(data[i].testResults);
                            createTestTree(data[i].testResults);
                        } else {
                            element.innerHTML = "No test method found";
                        }
                    } else {
                        generatedCodeView.setOutput(data[i]);
                    }
                }
                $(consoleElement).height($(wrapper).height() - $(statistic).outerHeight(true));
            }
        };
        return instance;
    }

    var Status = {
        OK: "OK",
        FAIL: "FAIL",
        ERROR: "ERROR"
    };

    function findCommonPackage(classNames) {
        classNames = classNames.sort();
        var firstPackage = classNames[0].split('.');
        var lastPackage = classNames[classNames.length - 1].split('.');
        var j = 0;
        while (firstPackage.length > j && lastPackage.length > j && firstPackage[j] == lastPackage[j]) {
            ++j;
        }
        return firstPackage.slice(0, j);
    }

    function createTestTree(data) {
        var testsData = {};
        for (var i = 0; i < data.length; ++i) {
            testsData[data[i].className + '.' + data[i].methodName] = {
                output: data[i].output,
                exception: data[i].exception
            };
        }

        var classNames = [];
        for (var i = 0; i < data.length; ++i) {
            classNames.push(data[i].className);
        }
        var commonPackage = findCommonPackage(classNames);

        var commonPackageFullName = "";
        if (commonPackage.length > 0) {
            commonPackageFullName = commonPackage[0];
            for (var i = 1; i < commonPackage.length; ++i) {
                commonPackageFullName += '.' + commonPackage[i];
            }
        } else {
            commonPackageFullName = "<default package>"
        }

        var rootNode = {
            children: [],
            name: "",
            icon: "ok",
            id: commonPackageFullName
        };
        rootNode.name = commonPackage[commonPackage.length - 1];

        if (commonPackageFullName == classNames[0]) {
            for (var i = 0; i < data.length; ++i) {
                var testNode = {
                    children: [],
                    name: getClassNameWithoutAPackage(data[i].methodName),
                    icon: data[i].status.toLowerCase(),
                    id: data[i].className + '.' + data[i].methodName
                };
                rootNode.children.push(testNode);
                if (data[i].status == Status.ERROR) {
                    rootNode.icon = "error";
                } else if (data[i].status == Status.FAIL && rootNode.icon != "error") {
                    rootNode.icon = "failed";
                }
            }
        } else {
            var classNodes = {};
            for (var i = 0; i < data.length; ++i) {
                if (classNodes[data[i].className] == null) {
                    classNodes[data[i].className] = {
                        children: [],
                        name: getClassNameWithoutAPackage(data[i].className),
                        icon: data[i].status.toLowerCase(),
                        id: data[i].className
                    };
                    rootNode.children.push(classNodes[data[i].className]);
                }
                var classNode = classNodes[data[i].className];
                var testNode = {
                    children: [],
                    name: data[i].methodName,
                    icon: data[i].status.toLowerCase(),
                    id: data[i].className + '.' + data[i].methodName
                };
                classNode.children.push(testNode);

                if (data[i].status == Status.ERROR) {
                    classNode.icon = "error";
                    rootNode.icon = "error";
                } else if (data[i].status == Status.FAIL && rootNode.icon != "error") {
                    classNode.icon = "failed";
                    rootNode.icon = "failed";
                }
            }
        }

        var tree = document.createElement("ul");
        tree.id = "test-tree";
        displayTreeNode(rootNode, tree);

        function printTestOutput(element) {
            if ($(element).hasClass("at-no-children")) {
                var testData = testsData[element.id];
                consoleOutputView.out.print(unEscapeString(testsData[element.id].output));
                if (testData.exception != null && testData.exception.fullName != "java.lang.AssertionError") {
                    consoleOutputView.printException(testData.exception);
                } else if (testData.exception != null) {
                    var difference = getDifference(unEscapeString(testData.exception.message));
                    consoleOutputView.err.println(testData.exception.fullName + ":");
                    consoleOutputView.err.println("");
                    consoleOutputView.out.print("Expected: ");
                    consoleOutputView.err.println(difference.expected);
                    consoleOutputView.out.print("Actual: ");
                    consoleOutputView.err.println(difference.actual);
                    consoleOutputView.err.print("    ");
                    consoleOutputView.addElement(makeDifferenceReference(difference));
                    consoleOutputView.out.println("");
                    consoleOutputView.out.println("");
                    consoleOutputView.printStackTrace(testData.exception.stackTrace);
                }
            } else {
                $.each($(element).children("ul").children("li"), function (i, elem) {
                    printTestOutput(elem)
                });
            }
        }

        $(tree).a11yTree({
            toggleSelector: ".tree-node-header .toggle-arrow",
            treeItemLabelSelector: '.tree-node-header .text',
            onFocus: function (element) {
                consoleOutputView.clear();
                printTestOutput(element[0]);
            }
        });
        navTree.appendChild(tree);
    }

    function displayTreeNode(node, parentElement) {
        var nodeElement = document.createElement("li");
        nodeElement.className = "tree-node";
        nodeElement.id = node.id;
        parentElement.appendChild(nodeElement);

        var nodeElementHeader = document.createElement("div");
        nodeElementHeader.className = "tree-node-header";
        nodeElement.appendChild(nodeElementHeader);

        var img = document.createElement("div");
        img.className = "img " + node.icon;
        nodeElementHeader.appendChild(img);

        var text = document.createElement("div");
        text.className = "text";
        text.innerHTML = node.name;
        nodeElementHeader.appendChild(text);

        if (node.children.length > 0) {
            var toggle = document.createElement("div");
            toggle.className = "toggle-arrow";
            nodeElementHeader.insertBefore(toggle, nodeElementHeader.firstChild);

            var childrenNode = document.createElement("ul");
            for (var i = 0; i < node.children.length; ++i) {
                displayTreeNode(node.children[i], childrenNode);
            }
            nodeElement.appendChild(childrenNode);
        }
    }

    function createStatistics(data) {
        var totalTime = 0.0;
        var noOfFailedTest = 0;
        for (var i = 0; i < data.length; ++i) {
            totalTime += data[i].executionTime / 1000.0;
            if (data[i].status == Status.FAIL || data[i].status == Status.ERROR) {
                ++noOfFailedTest;
            }
        }
        displayStatistic(data.length, noOfFailedTest, totalTime, null);
    }

    function displayStatistic(testsNumber, testsFailed, time, status) {
        if (testsFailed == 0) {
            statisticText.innerHTML = "All tests passed in " + time.toFixed(3) + "s)";
        } else {
            statisticText.innerHTML = "Failed: " + testsFailed + " of " + testsNumber + " (in " + time.toFixed(3) + "s)";
        }

        var testsStatusElement = document.createElement("div");
        testsStatusElement.id = "tests-status-bar";
        statistic.appendChild(testsStatusElement);

        var backgroundElement = document.createElement("div");
        backgroundElement.className = "background";
        testsStatusElement.appendChild(backgroundElement);

        if (status == Status.ERROR || status == Status.FAIL) {
            backgroundElement.className += " fail";
        } else {
            backgroundElement.className += " ok";
        }
    }

    function getClassNameWithoutAPackage(fullClassName) {
        var path = fullClassName.split('.');
        return path[path.length - 1];
    }

    function getDifference(exceptionMessage) {
        exceptionMessage = exceptionMessage.replace(/\n/g, '</br>');
        var regExp = /Expected\s*<(.*)>\s*actual\s*<(.*)>/;
        var regExpExecResult = regExp.exec(exceptionMessage);
        var expectedLines = regExpExecResult[1].split('</br>');
        var actualLines = regExpExecResult[2].split('</br>');

        var differences = [];
        var i = 0;
        while (expectedLines[i] != null && actualLines[i] != null) {
            if (expectedLines[i] != actualLines[i]) {
                differences.push(i + 1);
            }
            ++i;
        }
        if (expectedLines.length > i) {
            while (i < expectedLines.length) {
                differences.push(++i)
            }
        }
        if (actualLines.length > i) {
            while (i < actualLines.length) {
                differences.push(++i)
            }
        }

        return {
            expected: regExpExecResult[1],
            actual: regExpExecResult[2],
            differences: differences
        }
    }

    function makeDifferenceReference(difference){
        var a = document.createElement("a");
        a.innerText = "<click to see a difference>";
        a.onclick = function(event){
            differenceDialog.open(difference);
            event.stopPropagation();
        };
        return a;
    }

    return JUnitView;
})
();