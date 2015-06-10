/*
 * Copyright 2000-2015 JetBrains s.r.o.
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

package utils

import org.w3c.dom.HTMLIFrameElement
import org.w3c.dom.Location
import kotlin.browser.document
import kotlin.browser.window

enum class KeyCode (val code: Int){
    S(83),
    R(82),
    F9(120),
    ENTER(13),
    ESCAPE(27)
}

fun parseBoolean(value: String) = when (value) {
    "true" -> true
    "false" -> false
    else -> throw IllegalArgumentException("Value don't represent boolean")
}

fun addKotlinExtension(filename: String): String = filename.removeSuffix(".kt")

fun removeKotlinExtension(filename: String): String = if (filename.endsWith(".kt")) filename.substring(0, filename.size - ".kt".size) else filename;

private val tagsToReplace = hashMapOf(
    "&" to "&amp;",
    "<" to "&amp;lt;",
    ">" to "&amp;gt;",
    " " to "%20"
);

var userProjectPrefix = "/UserProjects/"


fun unEscapeString(s: String): String {
    var unEscapedString = s
    for (tagEntry in tagsToReplace) {
        unEscapedString = unEscapedString.replace(tagEntry.getValue(), tagEntry.getKey());
    }
    return unEscapedString;
}

fun escapeString(s: String): String {
    var escapedString = s
    for (tagEntry in tagsToReplace) {
        escapedString = escapedString.replace(tagEntry.getKey(), tagEntry.getValue());
    }
    return escapedString;
}

fun getProjectIdFromUrl(): String {
    var urlHash = escapeString(window.location.hash); //escaping for firefox
    urlHash = urlHash.removePrefix("#")
    if (urlHash.startsWith(userProjectPrefix)) {
        urlHash = urlHash.removePrefix(userProjectPrefix);
        return urlHash.splitBy("/")[0];
    }
    return urlHash.substring(0, urlHash.lastIndexOf("/"));
}

fun getFileIdFromUrl(): String {
    var urlHash = escapeString(window.location.hash); //escaping for firefox
    urlHash = urlHash.removePrefix("#")

    if (urlHash.startsWith(userProjectPrefix)) {
        urlHash = urlHash.removePrefix(userProjectPrefix);
        return urlHash.splitBy("/")[1];
    } else {
        return urlHash;
    }
}

fun setState(hash: String, title: String) {
    var unescapedHash = unEscapeString(hash);
    unescapedHash = if(unescapedHash.startsWith("#")) unescapedHash else "#" + unescapedHash;
    document.title = title + " | Try Kotlin";
    if (window.location.hash != unescapedHash) {
        if ((window.location.hash == "" || window.location.hash == "#") && window.location.search == "") {
            window.history.replaceState("", title, unescapedHash);
        } else {
            window.history.pushState("", title, unescapedHash);
        }
    }
}

fun clearState() {
    window.history.replaceState("", "", "/index.html");
}


fun isUserProjectInUrl() = window.location.hash.startsWith("#" + userProjectPrefix);

native
val Location.protocol: String

native
val Location.host: String

native
fun blockContent()

native
fun unBlockContent()

native
val ActionStatusMessages: dynamic = noImpl

native
val Configuration: dynamic

native
val ConfigurationType: dynamic

native
val Object: dynamic

native
val incompleteActionManager: dynamic = noImpl

fun HTMLIFrameElement.clear(){
    this.contentWindow!!.location.reload();
}

native
fun safe_tags_replace(string: String): String