<%@ include file="/init.jsp" %>

<portlet:defineObjects />
<liferay-theme:defineObjects />

<div id="<portlet:namespace />"></div>

<aui:script require="r-studio@1.0.0">
	rStudio100.default('<portlet:namespace />');
</aui:script>


