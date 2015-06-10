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

import kotlin.browser.window

native("$")
private object JQuery{
    fun ajax(params: Json)
}

public fun ajax(url: String, success: (dynamic) -> Unit, dataType: DataType, type: RequestType, data: Json,
                timeout: Int, error: (dynamic, String, String) -> Unit, complete: () -> Unit) {
    JQuery.ajax(json(
            "url" to url,
            "success" to success,
            "dataType" to dataType.name().toLowerCase(),
            "type" to type.name().toLowerCase(),
            "data" to data,
            "timeout" to timeout,
            "error" to error,
            "complete" to complete
    ))
}

public enum class DataType() {
    JSON
}

public enum class RequestType() {
    GET,
    POST
}