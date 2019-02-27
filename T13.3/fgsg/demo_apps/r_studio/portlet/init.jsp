<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>
<%@ taglib uri="http://liferay.com/tld/theme" prefix="liferay-theme" %>
<%@ taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>
<%@page import="java.io.*" %>
<%@page import="java.net.*" %>
<%@page import="java.util.Base64" %>
<%@page import="com.liferay.portal.kernel.json.*" %> 
<%@page import="it.infn.ct.FutureGatewayAPIs" %> 
<portlet:defineObjects />
<liferay-theme:defineObjects />

<%
    // FG settings
    String fgUser = "futuregateway";
    String fgPassword = "futuregateway";
    String fgBaseUrl = "http://fgapiserver";
    String fgAPIVer = "v1.0";
    boolean fgStatus = false;
    String errMessage = "";

    // Application settings
    String appName = "rstudio";
    int appId = 0;
    String appGroup = appName;

    // Initialize FutureGatewayAPIs object
    FutureGatewayAPIs fgAPIs = new FutureGatewayAPIs(
        fgBaseUrl,
	fgAPIVer,
	fgUser,
	fgPassword);

    // Check FG service
    fgStatus = fgAPIs.checkServer();

    // Retrieve user account information
    String screenName = user.getScreenName();
    String firstName = user.getFirstName();
    String lastName = user.getLastName();
    String emailAddress = user.getEmailAddress();

    // User settings
    int userId = 0;
    boolean userExists = false;
    boolean userGroup = false;
    String portletAccessToken = "";
    String delegatedAccessToken = "";

    // Use FGAPIs to check user and retieve tokens
    if(fgStatus) {
        // 1st Get the portlet token
        portletAccessToken = fgAPIs.getAccessToken(fgUser, null);
   
        // 2nd Check if the user exists
        fgAPIs.setAuthMode(FutureGatewayAPIs.AuthModes.BASELINE_TOKEN);
        userExists = fgAPIs.userExists(screenName);
        if(!userExists) {
            // User does not exists, create it
            fgAPIs.createUser(screenName,
	                      firstName,
                              lastName,
                              emailAddress,
                              "");
            // Check if the inserted user now exists
            userExists = fgAPIs.userExists(screenName);
        }

        // 3rd Retrieve the delegated access token (user token)
	if(userExists) {
           delegatedAccessToken = fgAPIs.getAccessToken(fgUser, screenName);

	   // 4th Does the user belong to application group?
           userGroup = fgAPIs.userHasGroup(screenName, appGroup);
           // WARNING: Automated group registration could need a specific
           //          moderation activity performed by an administrator
           //          in such a case the following statements should be
           //          removed
	   if(!userGroup) {
	       fgAPIs.setBaselineToken(portletAccessToken);
	       String[] userGroups = { appGroup };
	       fgAPIs.addUserGroups(screenName, userGroups);
	       fgAPIs.setBaselineToken(delegatedAccessToken);
	   }
        }
    }

    // The GUI interface has now enough information to perform next activitis
    // using the FutureGateway APIs with the delegatedAccessToken
%>

<script type="text/javascript">

  // Collect user account info into FG user info
  var fg_user_info = {
    id: null,
    name: '<%= screenName %>',
    first_name: '<%= firstName %>',
    last_name: '<%= lastName %>',
    email: '<%= emailAddress %>',
    insitute: 'unknown',
    err_message: '<%= errMessage %>',
    access_token: '<%= delegatedAccessToken %>',
    user_exists: '<%= userExists %>',
    user_group: '<%= userGroup %>',
    portlet_token: '<%= portletAccessToken %>', // To be removed!!!
  };

  // FG API server settings
  var fg_api_settings = {
    base_url: 'https://fgsg.ct.infn.it/fgapiserver',
    version: 'v1.0',
    enabled: '<%= fgStatus %>',
  };

  // Application settigns
  var fg_app_settings = {
    name: '<%= appName %>',
    id: '<%= appId %>',
    group_name: '<%= appGroup %>',
  };
</script>
