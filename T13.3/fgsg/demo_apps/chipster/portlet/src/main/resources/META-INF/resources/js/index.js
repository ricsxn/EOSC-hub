/**************************************************************************
 * Copyright (c) 2019:
 * Istituto Nazionale di Fisica Nucleare (INFN), Italy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *     @author <a href="mailto:riccardo.bruno@ct.infn.it">Riccardo Bruno</a>(INFN)
 *     ****************************************************************************/
import $ from 'jquery';

var application_name = 'chipster';
var welcomeText = "This application manages remote chipster user accounts. " +
	          "The password must satisfy specific password rules, that " +
	          "you can see, by pressing the information button, beside " +
	          "the password confirmation text. At the end of the password " +
	          "input text, you can check if the password satisfies the rules " +
	          "when a checker icon appears instead of a cross.";
var default_username = '';
var default_password = '';

function build_page() {
  // Below the structure of the page containing elemennts:
  //   * User info
  //   * Application info
  //   * Task info and its output
  var html = "<div class=\"" + application_name + "\">" +
             "  <p>" + welcomeText + "</p>" +
             "  <div class=\"error\"></div>" +
             "  <div class=\"user_info\"></div>" +
             "  <div class=\"app_info\"></div>" +
             "  <div class=\"submission_form\"></div>" +
             "  <div class=\"configuration_form\"></div>" +
             "  <div class=\"task_info\"></div>" +
             "</div>";
  if(themeDisplay.isSignedIn()) {
      // init call may report errors to be notified
      if(fg_user_info.err_message.length>0) {
          message = "Unable to retrieve information for user: '" +
                    fg_user_info.name + "'; error: '" +
                    fg_user_info.err_message;
          report_error(message, user_support);
      } else {
          // Performs a cascading check on user, app and task
          // adding dynamically elements into the web pages
          // accordingly to the FG API calls performed
          check_user_app_tasks();
      }
  } else {
    mail_subject = "User support for application: " + application_name;
    mail_body = "I would like to be contacted in order to get access or " +
                "receive more information about the application: '" + application_name +
                "'.\nMany thanks,\nRegards\n" + "<your name>";
    // Notify that this service is available only for logged users
    html = "<div class=\"alert alert-danger\" role=\"alert\">" +
           "  <button type=\"button\"" +
           "          class=\"close\"" +
           "          data-dismiss=\"alert\">&times;</button>" +
           "  <strong>Warning!</strong> " + 
           "You have to sign-in to access this service." +
           "</div>" +
           "<div class=\"disclaimer\">" + 
           "<p>Please contact the <a href=\"" + user_support +
           "?subject=" + mail_subject + "&body=" + mail_body + 
           "\">user support</a> to get information and instructions " +
           "about the access to this application." +
           "</p></div>";
  }
  return html;
}

// Do a cascading cleanup action on top of div contents
// This does not affect div data content
function reset_areas(area) {
    $("." + area).empty();
}

// Report an error message to the interface
function report_error(message, support_url) {
  mail_subject = "User support for application: " + application_name;
  mail_body = "Reported error: '" + message + "'";
  $('.error').append(
    "<div class=\"alert alert-danger\" role=\"alert\">" +
    "<p>" + message + "</br>" +
    "You can notify this problem, by clicking <a href=\"" +
    support_url + "?subject=" + mail_subject + "&body=" + mail_body +
    "\">here</a>." + 
    "</p></div>"
  );
}

// Reset submission form
function reset_form(username, password) {
    $("#username").val(username);
    $("#password").val(password);
    $("#confirm_password").val(password);
    control_item = $('#password_checker').find('span');
    control_class = $(control_item).prop('class');
    $(control_item).removeClass(control_class);
    $(control_item).addClass("glyphicon glyphicon-remove");
}

// True if password rules are not satisfied
function password_rules_fails() {
    password = $("#password").val();
    // Rules:
    //   At least one low case letter [a-z]
    //   At least one capital letter [A-Z]
    //   At least one number [0-9]
    //   At least two special characters except ':'
    //      [!@#$%^&*()_+\-=\[\]{};'"\\|,.<>\/?] 
    //   At least 8 characters long
    re1 = /[a-z]/;
    re2 = /[A-Z]/;
    re3 = /[0-9]/;
    re4 = /[!@#$%^£&*(),.?"{}|<>]/;
    re5 = /[!@#$%^£&*()_+\-=\[\]{};'"\\|,.<>\/?][!@#$%^£&*()_+\-=\[\]{};'"\\|,.<>\/?]/;
    return !(re1.test(password) &&
             re2.test(password) &&
             re3.test(password) &&
             re4.test(password) &&
             re5.test(password) &&
             password.length > 7);
}

// Check form
function check_form() {
    username = $("#username").val();
    password = $("#password").val();
    confirm_password = $("#confirm_password").val();
    if(password != confirm_password ||
       username == null ||
       username == '' ||
       password_rules_fails()) {
      return false;
    }
    return true;
}

// Reset form to default username and password
var reset_default = function() {
    reset_form(default_username, default_password);
}

// Success case for do_task 
var do_task_done = function(data) {
    // Notify success action
    alert("New " + application_name + " task has been successfully created");
    // Case of existing task starts from here
    reset_default();
    // Update task_info view
    check_tasks(application_name);
}

// Refresh task view
var refresh_tasks = function(data) {
    check_tasks(application_name);
}

// Error case for do_task 
var do_task_error = function(jqXHR, exception) {
    alert("Error creating new task");
}

// Generic task submission call SUBMIT
function do_task(username, password) {
    // Execute Submit POST command
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/tasks';
    taskData = {
        "application": app_info['id'],
        "description": application_name + " fgsg",
        "arguments": [username, password ],
        "output_files": [{"name": "user.json"}],
    };
    doPost(url, taskData, do_task_done, do_task_error);
}

// Perform application submission
function do_submit() {
    $("#submit_button").prop('disabled','true');
    username = $('#username').val(); 
    password = $("#password").val();
    do_task(username, password);
    $("#submit_button").removeAttr("disabled");
}
 
// Confirm submission action
function confirm_dialog(message, action) {
    if(confirm(message)) {
        action();
    } else {
        console.log("Execution cancelled");
    }
}

function exec_application() {
   if(check_form()) {
       confirm_dialog("Are you sure to submit " + application_name + "?", do_submit);
   } else {
       alert("Please specify a valid username or matching passwords");
   }
}

// Success trash_task
var trash_task_done = function() {
    alert("Task successfully removed");
    check_tasks(application_name);
}

// Error trash_task
var trash_task_error = function() {
    alert("Sorry, unable to delete task");
}

// Trash the selected task
var trash_task = function() {
    task_id = this.trash_task_id;
    table_row = this.trash_task_row;
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/tasks/' + task_id;
    doDelete(url, trash_task_done, trash_task_error);
}

// Task record action
var do_action_button = function() {
    trash_table_row = this.id.split('_')[1]; // i-th element of task table
    trash_task_id = this.id.split('_')[2]; // FG task_id
    if(this.name == 'trash') {
      confirm_dialog("Are you sure to remove the task?", trash_task);
    } else if(this.name == 'refresh') {
      check_tasks(application_name);
    } else {
      alert("Unhespected task action: '" + this.name + "'");
    }
}

// Toggle view of a password record item
var do_eyebutton = function() {
    task_id = this.id.split('_')[3];
    control_item = $('#toggle_password_view_' + task_id).find('span');
    control_class = $(control_item).prop('class');
    if(control_class == 'glyphicon glyphicon-eye-close') {
        new_class = 'glyphicon glyphicon-eye-open';
        new_type = 'text';
    } else {
        new_class = 'glyphicon glyphicon-eye-close';
        new_type = 'password';
    }
    $(control_item).removeClass(control_class);
    $(control_item).addClass(new_class);
    $('#password_' + task_id).attr('type', new_type);
}

// Called during password control change it flags correct passwords
var password_checker = function() {
  control_item = $('#password_checker').find('span');
  control_class = $(control_item).prop('class');
  $(control_item).removeClass(control_class);
  if(password_rules_fails()) {
    $(control_item).addClass("glyphicon glyphicon-remove");
  } else {
    $(control_item).addClass("glyphicon glyphicon-ok");
  }
}

// Build the tasks table from passed task_info values
function build_tasks_table(task_data) {
    var table_rows="";
    for(var i=0; i<task_data.length; i++) {
        var status = task_data[i].status;
        var task_id = task_data[i].id;
        var creation = task_data[i].creation;
        var user = task_data[i].arguments[0];
  var eye_button = "<button name=\"toggle_password_view_" + task_id + "\"" +
             "        id=\"toggle_password_view_" + task_id + "\">" +
             "        <span class=\"glyphicon glyphicon-eye-close\"></span></button>";
        var password = "<input id=\"password_" + task_id + "\"" +
                       "       type=\"password\"" +
                       "       name=\"password_" + task_id + "\"" +
           "       value=\"" + task_data[i].arguments[1] + "\">";
        var action_button = "";
        if(status == "DONE") {
            status = "<span class=\"badge badge-pill badge-success\">DONE</span>";
            action_button =
                "<button name=\"trash\" id=\"task_" + i + "_" + task_id + "\">" +
                "<span class=\"glyphicon glyphicon glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>" +
                "</button>";
        } else if(status == "ABORTED") {
            status = "<span class=\"badge badge-pill badge-danger\">ABORT</span>";
             action_button =
                 "<button name=\"trash\" id=\"task_" + i + "_" + task_id + "\">" +
                 "<span class=\"glyphicon glyphicon glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>" +
                 "</button>";
        } else if(status == "RUNNING") {
            status = "<span class=\"badge badge-pill badge-primary\">RUNNING</span>";
            action_button = 
                "<button name=\"refresh\" id=\"task_" + i + "_" + task_id + "\">" +
                "<span class=\"glyphicon glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>" +
                "</button>";
        } else {
            status = "<span class=\"badge badge-pill badge-warning\">" + status  + "</span>";
            action_button = 
                "<button name=\"refresh\" id=\"task_" + i + "_" + task_id + "\">" +
                "<span class=\"glyphicon glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>" +
                "</button>";
        }
        table_rows += 
            "<tr>" +
            "<td>" + action_button + "</td>" +
            "<td>" + creation + "</td>" + 
            "<td>" + status + "</td>" +
            "<td>" + user + "</td>" +
            "<td>" + password + eye_button + "</td>" +
            "</tr>";
    }
    // Fill table if task records exist
    if(table_rows.length > 0) {
      $(".task_info").append(
        "    <table id=\"task_table_title\">" +
        "    <tr><td>" +
        "        <button id=\"refresh_tasks\">" +
        "        <span class=\"glyphicon glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>" +
        "        </button></td>" +
        "        <td><h4>Executions</h4></td></tr>" +
        "    </table>" +
        "    <table id=\"task_table\" class=\"table\"></table>");
      $("#refresh_tasks").on("click",refresh_tasks);
      $('#task_table').append(
        "<tr>" + 
        "<th>Action</th>" + 
        "<th>Date</th>" +
        "<th>Status</th>" +
        "<th>User</th>" +
        "<th>Password</th>" +
        "</tr>");
      $('#task_table').append(table_rows);
      // Assign right function call to generated refresh buttons
      for(var i=0; i<task_data.length; i++) {
          var task_id = task_data[i].id;
          $("#task_" + i + "_" + task_id).on("click",do_action_button);
    $("#toggle_password_view_" + task_id).on("click", do_eyebutton);
      }
    } else {
      // Report no records are available yet
      $('.task_info').append(
          "<div class=\"alert alert-info\" role=\"alert\">No tasks avaiable yet for this application</div>"
      );
    }
}

// Toggle password views() 
function toggle_password_views() {
    value = null;
    value = toggle_password_view("password");
    value = toggle_password_view("confirm_password");
    if (value == 0) {
        $('#toggle_password_view').find('span').removeClass('glyphicon glyphicon-eye-close')
        $('#toggle_password_view').find('span').addClass('glyphicon glyphicon-eye-open')
    } else {
        $('#toggle_password_view').find('span').removeClass('glyphicon glyphicon-eye-open')
        $('#toggle_password_view').find('span').addClass('glyphicon glyphicon-eye-close')
    }
}

// Toggle password visibility
function toggle_password_view(password_input) {
  value = null;
  if($('#' + password_input).attr('type') == "password") {
    $('#' + password_input).attr('type', 'text');
    value = 0;
  } else {
    $('#' + password_input).attr('type', 'password');
    value = 1;
  }
  return value;
}

// Create the application submission form
function build_submission_form() {
    reset_areas("submission_form");
    modal_body = 
        "<p>Password content must comply with the following rules:"+
        "<ul><li>At least <b>one letter</b></li>" +
        "    <li>At least <b>one capital letter</b>" +
        "    <li>At least <b>one number</b>" +
        "    <li>At leatt <b>two special characters, except the ':' character</b>" +
        "    <li>At least <b>eight characters long</b></p>";
    $(".submission_form").append(
      "<div class=\"modal fade\" id=\"info_pass_modal\" tabindex=\"-1\" role=\"dialog\" style=\"display: none;\">" +
      "<div class=\"modal-dialog\" role=\"document\">" +
      "<div class=\"modal-content\">" +
      "  <div class=\"modal-header\">" +
      "    <h4 class=\"modal-title\">Password rules</h4>" +
      "    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">" +
      "      <span aria-hidden=\"true\">&times;</span>" +
      "    </button>" +
      "  </div>" +
      "  <div class=\"modal-body\">" +
      modal_body +    
      "  </div>" +
      "  <div class=\"modal-footer\">" +
      "    <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>" +
      "  </div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "<div><h3>Specify user account data</h3><br/>" +
      "<table>" +
      "<tr><td><label for=\"username\">User name:</label></td>" +
      "    <td></td>" +
      "    <td><input id=\"username\"" +
      "               type=\"text\"" +
      "               id=\"username\"" +
      "               name=\"username\"</td>" +
      "    <td></td></tr>" +
      "<tr><td><label for=\"password\">Password:</label></td>" +
      "    <td></td>" +
      "    <td><input id=\"password\"" +
      "               type=\"password\"" +
      "               name=\"password\"></td>" +
      "    <td><button name=\"password_checker\"" +
      "                id=\"password_checker\" disabled>" +
      "                <span class=\"glyphicon glyphicon-remove\"></span></td></tr>" +
      "<tr><td><label for=\"confirm_password\">Confirm:</label></td>" +
      "    <td></td>" +
      "    <td><input id=\"confirm_password\"" +
      "               type=\"password\" id=\"confirm_password\"" +
      "               name=\"confirm_password\"></td>" +
      "    <td><button name=\"password_info\"" +
      "                id=\"password_info\"" +
      "                data-toggle=\"modal\" data-target=\"#info_pass_modal\">" +
      "        <span class=\"glyphicon glyphicon-info-sign\"></span>" +
      "        </button></td></tr>" +
      "<tr><td><label for=\"toggle_password_view\">View password:</label></td>" +
      "    <td></td>" +
      "    <td><button name=\"toggle_password_view\"" +
      "                id=\"toggle_password_view\">" +
      "                <span class=\"glyphicon glyphicon-eye-close\"></span></button></td>" +
      "    <td></td></tr>" +
      "<tr><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td><button type=\"submit\" " +
      "                class=\"btn btn-success\" " +
      "                id=\"submit_button\">Execute</button></td>" +
      "    <td></td>" +
      "    <td><button class=\"btn btn-danger\" " +
      "                id=\"reset_button\">Reset</button></td>" +
      "    <td></td></tr>" +
      "</table>" +
      "</div>");
    reset_form(default_username, default_password);
    $("#submit_button").on("click",exec_application);
    $("#reset_button").on("click",reset_default);
    $("#toggle_password_view").on("click",toggle_password_views);
    $("#password").on('input', password_checker);
    $("#password").on('keyup', password_checker);
}

// Success case for check task 
var proc_check_tasks = function(data) {
    reset_areas("task_info");
    // Process and create the task list 
    task_info = data['tasks'];
    $('.task_info').data('task_info',data['tasks']);
    // Now build tasks table
    build_tasks_table(task_info);
}

// Error case for check task
var proc_check_tasks_error = function(jqXHR, exception) {
    reset_areas("task_info");
    report_error("Error retrieving task information for '" +
                 application_name + "' application. ",
                 user_support);
}

// Error case for check task
var proc_check_tasks_error = function(jqXHR, exception) {
    reset_areas("task_info");
    report_error("Error retrieving task information for '" +
                 application_name + "' application. ",
                 user_support);
}

// Check task
function check_tasks(application) {
   url = fg_api_settings.base_url + '/' +
         fg_api_settings.version  + '/users/' +
         fg_user_info.name + '/tasks?application=' +
         application;
    doGet(url, proc_check_tasks, proc_check_tasks_error);
}

// Success case for check_app
var proc_check_app_tasks = function(data) {
    if(data.id != null) {
        // Application hidden data
        app_info = {
            'id': data.id,
            'name': data.name,
        };
        $('.app_info').data('app_info',app_info)
        // Now it is possible to build the submission form
        build_submission_form();
        // Now check the application tasks
        check_tasks(application_name);
    } else {
        reset_areas("app_info");
        report_error("It seems the application '" + application_name +
                     "' is not registered in FutureGateway. ",
                      user_support);
    }
}

//Error case for check_app
var proc_check_app_tasks_error = function(jqXHR, exception) {
    reset_areas("app_info");
    report_error("Error retriving '" + application_name + "' application " +
                 "information from FutureGateway. Please ensure your " +
                 "membership has the necessary rights to access '" +
                 application_name + "' application.",
                 user_support);
}

// Check application
function check_app_tasks(application) { 
   url = fg_api_settings.base_url + '/' +
         fg_api_settings.version + '/applications/' +
         application;
    doGet(url, proc_check_app_tasks, proc_check_app_tasks_error);
}

// Success case for check_user_app_tasks
var proc_user_app_tasks = function(data) {
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
        check_app_tasks(application_name);
    } else {
        reset_areas("user_info");
        report_error("It seems you are not yet registered as " +
                     "FutureGateway user.",
                     user_support);
    }
}

// Error case for check_user_app_task
var proc_user_app_tasks_error = function(jqXHR, exception) {
    reset_areas("user_info");
    report_error("Error retrieving portal user information.",
                 user_support);
}

// Check user application and task
function check_user_app_tasks() {
    url = fg_api_settings.base_url + '/' +
          fg_api_settings.version  +'/users/' +
          fg_user_info.name;
    doGet(url, proc_user_app_tasks, proc_user_app_tasks_error);
}

//
// FutureGateway helper functions
//

function doGet(url, successFunction, failureFunction) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        cache: false,
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
        cache: false,
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
        cache: false,
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

export default function(rootElementId) {
  $(`#${rootElementId}`).html(build_page());
}
