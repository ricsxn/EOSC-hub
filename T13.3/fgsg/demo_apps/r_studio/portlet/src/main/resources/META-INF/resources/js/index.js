/*****************************************************************************
 * Copyright (c) 2011:
 * Istituto Nazionale di Fisica Nucleare (INFN), Italy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * @author <a href="mailto:riccardo.bruno@ct.infn.it">Riccardo Bruno</a>(INFN)
 *****************************************************************************/
import $ from 'jquery';

var applicationName = 'r-studio';
var applicationId = 5;

function build_page() {
  var html = "";
  if(themeDisplay.isSignedIn()) {
      // init call may report errors to be notified
      if(fg_user_info.err_message.length>0) {
          html = "<div class=\"error\"><p>" +
                 "<b>ERROR</b> " +
                 "Unable to retrieve information for user: '" +
                 fg_user_info.name + "'; error: '" +
                 fg_user_info.err_message +
             "'</p>";
          return html;
      }

      // Performs a cascading check on user, app and task
      // adding dynamically elements into the web pages
      // accordingly to the FG API calls performed
      check_user_app_task();
      
      // Below the structure of the page containing elemennts:
      //   * User info
      //   * Application info
      //   * Task info ans its output
      html = "<div class=\"application\">" +
             "<p>This application instantiate an R-Studio platform reserved " +
             "for portal users.</p>" +
             "<div class=\"user_info\"></div>" +
             "<div class=\"app_info\"></div>" +
             "<div class=\"task_info\"></div>" +
             "<div class=\"task_files\"></div>" +
             "<div class=\"app_data\"></div>" +
             "<div class=\"error\"></div>" +
             "</div>";
  } else {
      // Notify that this service is available only for logged users
      html = "<div class=\"alert\">" +
             "  <button type=\"button\"" +
             "          class=\"close\"" +
             "          data-dismiss=\"alert\">&times;</button>" +
             "  <strong>Warning!</strong> " + 
             "You have to sign-in to access this service." +
             "</div>" +
             "<div class=\"disclaimer\">" + 
             "<p>RStudio service access area, please contact the " +
             "science gateway administrator to get information and support" +
             " about this application.</p></div>";
  }
  return html;
}

// Do a cascading cleanup action on top of div contents
// This does not affect div data content
function resetAreas(area) {
    switch(area) {
        case "user_info":
            $(".user_info").empty();
        case "app_info":
            $(".app_info").empty();
        case "task_info":
            $(".task_info").empty();
        case "task_files":
            $(".task_files").empty();
        case "app_data":
            $(".app_data").empty();
        case "error":
            $(".error").empty();
    }
}

function reportError(message, support_url) {
    $('.error').append(
        "<p>" + message + " " +
        "You can notify this problem, by clicking <a href=\"" +
        support_url + 
        "\">here</a>." + "<p>");
}

function taskRefreshButton(hasArgs) {
    if(hasArgs) {
        message = "A task releasing the '" + applicationName + "' application is executing."
    } else {
        message = "A task allocating application '" + applicationName + "' is executing."
    }
    $('.task_info').append(
        "<div class=\"refresh\">" +
        "<p>" + message +
        " Pressing the following button you can refresh the task status.</p>" +
        "<button type=\"button\"" +
        "        id=\"refresh_button\"" +
        "        class=\"btn btn-success\"" +
        ">REFRESH</button>" +
        "</div>");
    $("#refresh_button").on("click", refreshPage);
}

// Refresh button
var refreshPage = function() {
    resetAreas("task_info"); 
    check_task(applicationName);
}

// Successful submission case 'SUBMIT'
var procTaskSubmit = function(data) {
    resetAreas("task_info");
    taskRefreshButton(false);
}

// Successful submission case 'DELETE'
var procRelSubmit = function(data) {
    resetAreas("task_info");
    taskRefreshButton(true);
}

// Unsuccessful submission
var procTaskSubmitError = function(jqXHR, exception) {
    resetAreas("task_info");
    reportError("Error submitting task.", user_support);
}

// Confirm submission action
function ConfirmDialog(message, action) {
    if(confirm(message)) {
        resetAreas("app_data");
        action();
    } else {
        $("#submit").prop('disabled',false);
    }
}

// SUBMIT, DELETE and RETRY submission actions
var submitTask = function() {
    // Disable the submit button
    $("#submit").prop('disabled', true);
    // Determine submit action type
    sub_button = $('#submit_button').text();
    if(sub_button == 'DELETE') {
        actionMessage = "Are you sure to delete resources allocated for application: '" + applicationName + "'?";
        actionType = doDelRes;
    } else if (sub_button == 'SUBMIT') {
        actionMessage = "Do you really want to allocate resources for application: '" + applicationName + "'?";
        actionType = doSubmit;
    } else if (sub_button == 'RETRY') {
        actionMessage = "Do you really want to retry submisison for application: '" + applicationName + "'?";
        actionType = doDelSubmit;
    }else {
        alert("Hey! This should never happen!");
        actionType = null;
    }
    if(actionType != null) {
        ConfirmDialog(actionMessage, actionType);
    }
}

// Called in case of DELETE submission
var doDelRes = function() {
    container_id = JSON.parse($('.app_data').data('app_data')['docker_info'])[0]['Id']
    task_id = $('.task_info').data('task_info')['id']
    access_token = fg_user_info.access_token
    task_args = container_id + " " +
                task_id + " " +
                access_token;
    doTask(task_args);
}

// Called in case of normal SUBMISSION
var doSubmit = function() {
    task_args = "";
    doTask(task_args);
}

// Generic task submission call DELETE/SUBMIT
function doTask(task_args) {
    // Execute Submit POST command
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/tasks';
    if(task_args.length > 0) {
        action = "resource releasing";
        fnSubmit = procRelSubmit;
    } else {
        action = "submission";
        fnSubmit = procTaskSubmit;
    }
    taskData = {
        "application": applicationId,
        "description": "R-Studio " + action + " for user: '" + fg_user_info.name + "'",
        "arguments": [task_args, ],
        "output_files": [{"name": "rstudio.json"}],
    };
    doPost(url, taskData, fnSubmit, procTaskSubmitError);
}

// Resource deleted successful after RETRY, then submit again
var procDelSubmit = function() {
    resetAreas("task_info"); 
    doTask(""); 
}

// Unsuccessful resource delete
var procDelSubmitError = function() {
    resetAreas("task_files");
    reportError("Error deleting allocated resource", user_support);
}

// Delete submission task
var doDelSubmit = function() {
    task_id = $('.task_info').data('task_info')['id'];
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/tasks/' + task_id;
    doDelete(url, procDelSubmit, procDelSubmitError);
}

// Toggle password view mode
var switchPasswordView = function() {
    var passViewType = $("#app_pass").attr("type");
    if(passViewType == "text") {
        $("#app_pass").attr("type", "password");
    } else {
        $("#app_pass").attr("type", "text");
    }
}

// Paste password content into clipboard
const copyPassword = function() {
    const el = document.createElement('input');
    el.value = $("#app_pass").val();
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

// Success case for app_output
var procAppOutput = function(data) {
   // Output with errors
   if(data['error'] != null) {
        $('.task_files').append(
            "<p>The resource reservation process was not successful. " +
            "The error message is: '" + data['error'] + "'. " +
            "Pressing the following button, you can retry the submission" +
            "<div class=\"submit\"><button type=\"button\"" +
            "        id=\"submit_button\"" +
            "        class=\"btn btn-danger\"" +
            ">RETRY</button>" +
            "</div></p>");
        $("#submit_button").on("click", submitTask);
    return;
    } 
    // Ouptut successful
    var rstudio_host = 
        "http://fgsg.ct.infn.it:" +
        data[0]['NetworkSettings']['Ports']['8787/tcp'][0]['HostPort'] + "/";
    var rstudio_user = data[0]['Config']['Env'][0].split("=")[1];
    var rstudio_pass = data[0]['Config']['Env'][1].split("=")[1];
    $('.app_data').append(
        "<b>RStudio instance</b><br/>" +
        "<p>You can try to access the r-studio instance by clicking " +
        "<a href=\"" + rstudio_host + "\" target=\"_blank\">here</a>. " +
        "Credentials to access the machine are:<table class=\"table-responsive\">" +
        "<tr><td>User</td><td><input type=\"text\" value=\"" + rstudio_user + "\"></td></tr>" +
        "<tr><td>Password</td>" +
	"<td><input type=\"password\"" +
	"       title=\"Remote application access password\"" +
	"       value=\"" + rstudio_pass + "\"" +
	"       id=\"app_pass\"></td><td>" +
	"<input id=\"passwd_view\" type=\"checkbox\"> Show Password " +
	"<button id=\"clip_password\"><i class=\"glyphicon glyphicon-copy\"></i></button></td></tr>" +
        "</table></p>" +
        "<div class=\"del_task\">" +
        "<button type=\"button\"" +
        "        id=\"submit_button\"" +
        "        class=\"btn btn-danger\"" +
        ">DELETE</button>" +
        "</div>");
    $("#clip_password").on("click", copyPassword);
    $("#submit_button").on("click", submitTask);
    $("#passwd_view").on("click", switchPasswordView);

    // Application resources  hidden data
    app_data = {
        'docker_info': JSON.stringify(data),
        'username': rstudio_user,
        'password': rstudio_pass,
    };
    $('.app_data').data('app_data', app_data)
}

// Error case for app_output
var procAppOutputError = function(jqXHR, exception) {
    resetAreas(".task_files");
    reportError("Error retriving output data.", user_support);
}

// Retrieve application output
function app_output(resource_url) {
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version + '/' +
          resource_url;
    doGet(url, procAppOutput, procAppOutputError);
}

// Success case for get_task_info
var procTaskInfo = function(data) {
    // If arguments are not present, the task refers to
    // the application resource creation, only in this
    // case the access information have to be recovered
    if(data['arguments'][0].length == 0) {
        // Task file hidden data
        task_files = {};
        for(var i=0; i<data.output_files.length; i++) {
            var output_file = data.output_files[i];
            task_files[output_file.name] = output_file.url;
        }
        $('.task_files').data('task_files', task_files);
        // Now it is possible to get application data
        app_output(task_files['rstudio.json']);
    } else {
        // DONE cancellation task, the resource can be requested again
        no_app_task();
    }
} 

// Error case for get_task_info
var procTaskInfoError = function(jqXHR, exception) {
    resetAreas(".task_files");
    reportError("Error retrieving output files of task: '" + data.id + "'",
                user_support);
}

// Get task information
function get_task_info(task_id) {
   url = fg_api_settings.base_url + '/' +
         fg_api_settings.version  + '/users/' +
         fg_user_info.name + '/tasks/' +
         task_id;
    doGet(url, procTaskInfo, procTaskInfoError);         
}

// Notify that no active application tasks are present
var no_app_task = function() {
    $('.task_info').append(
       "<p>It seems you don't have yet a running task for '" +
       applicationName + "' application. " +
       "Please press the submit button to execute the application." +
       "<div class=\"submit\"><button type=\"button\"" +
       "        id=\"submit_button\"" +
       "        class=\"btn btn-danger\"" +
       ">SUBMIT</button>" +
       "</div></p>");
       $("#submit_button").on("click", submitTask);
}

// Success case for check task; this may point to:
//     * get_task_info if submission status == true
//     * refresh button if a submit action is in progress
//     * no_app_task if no submission jobs are present
var procTask = function(data) {
    if(data['tasks'].length > 0) {
        last_task = data['tasks'][0];
        // Task hidden data
        task_info = {
            'id': last_task.id,
            'status': last_task.status,
            'description': last_task.description,
            'iosandbox': last_task.iosandbox,
            'creation': last_task.creation,
            'last_change': last_task.last_change,
        };
        $('.task_info').data('task_info',task_info)
        // Task data recovered, show retrieve task details if status is DONE
        if(last_task.status == 'DONE') {
            get_task_info(last_task.id);
        } else {
          // No submission tasks are related to resource release
          taskRefreshButton(!last_task.description.includes("submission"));
        }
    } else {
        no_app_task();
    }
}

// Error case for check task
var procTaskError = function(jqXHR, exception) {
    resetAreas(".task_info");
    reportError("Error retrieving task information for '" +
                applicationName + "' application. ",
                user_support);
}

// Check task
function check_task(application) {
   url = fg_api_settings.base_url + '/' +
         fg_api_settings.version  + '/users/' +
         fg_user_info.name + '/tasks?application=' +
         application;
    doGet(url, procTask, procTaskError);         
}

// Success case for check_app
var procApp = function(data) {
    if(data.id != null) {
        // Application hidden data
        app_info = {
            'id': data.id,
            'name': data.name,
        };
        $('.app_info').data('app_info',app_info)
        // Application data recovered, now check the task
        check_task(applicationName);
    } else {
        resetAreas(".app_info");
        reportError("It seems the application '" + applicationName +
                    "' is not registered in FutureGateway. ",
                user_support);        
    }
}

//Error case for check_app
var procAppError = function(jqXHR, exception) {
    resetAreas(".app_info");
    reportError("Error retriving '" + applicationName + "' application " +
                "information from FutureGateway. Please ensure your " +
	        "membership has the necessary rights to instantiate '" +
	        applicationName + "' application.",
                user_support);
}

// Check application
function check_app(application) {
   url = fg_api_settings.base_url + '/' +
         fg_api_settings.version + '/applications/' +
         application;
    doGet(url, procApp, procAppError);         
}

// Success case for CheckUserAppTask
var procUserAppTask = function(data) {
    if(data.id != null &&
       data.mail != 'default@liferay.com') {
        // User hidden data
        user_info = {
            'id': data.id,
            'first_name': data.first_name,
            'last_name': data.last_name,
            'email': data.mail,
            'creation': data.creation,
            'modified': data.modified, 
        };
        $('.user_info').data('user_info',user_info);
        // User information recovered, it is possible to check the app.
        check_app(applicationName);
    } else {
        resetAreas(".user_info");
        reportError("It seems you are not yet registered as " +
                    "FutureGateway user.",
                    user_support);
    }
}

// Error case for CheckUserAppTask
var procUserAppTaskError = function(jqXHR, exception) {
    resetAreas(".user_info");
    reportError("Error retrieving portal user information.",
                user_support);
}

// Check user application and task
function check_user_app_task() {
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/users/' +
          fg_user_info.name;
    doGet(url, procUserAppTask, procUserAppTaskError);
}

//
// FutureGateway helper functions
//


function doGet(url, successFunction, failureFunction) {
    $.ajax({
        type: "GET", 
        url: url,
        dataType: "json",
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

function doPost(url, reqData, successFunction, failureFunction) {
    $.ajax({
        type: "POST",
        url: url,
        dataType: "json",
        data: JSON.stringify(reqData),
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

function doDelete(url, successFunction, failureFunction) {
    $.ajax({
        type: "DELETE",
        url: url,
        dataType: "json",
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

// Entrypoint
export default function(rootElementId) {

    // Prepare page
    var html = build_page();

    // Display page
    $(`#${rootElementId}`).html(html);
}
