function ExecuteScript(strId)
{
    switch (strId)
    {
        case "6YjCHTdsnmz":
            Script1();
            break;
        case "5gjJ15jjuUi":
            Script2();
            break;
        case "5WH7DJMjpaJ":
            Script3();
            break;
    }
}

function Script1()
{
    // debug alert("I'm in trigger");
    // no alert(player.GetVar("Text Entry"));
    // must use variable names not control names
    // alert(player.GetVar("Class"));
    // build querystring separately, allows careful encoding
    QS = "?" + "Name" + "=" + encodeURIComponent( player.GetVar("Name"));
    // for more args use & instead of ? 
    QS += "&" + "Class" + "=" + encodeURIComponent( player.GetVar("Class"));
    URL = "/AS1Step1.html" + QS,"NameCheck";
    var newWin=window.open( URL, "_self", "status=0,scrollbars=0,width=1366,height=800");
    // Message cannot be set
    // "self" will cause to reuse same window
}

function Script2()
{
    // debug alert("I'm in trigger");
    // must use variable names, not control names
    // alert(player.GetVar("Name"));
    player.SetVar( "Message", 
        CheckAvailabilityOfName( player.GetVar("Name"), player.GetVar("Class"))
        );
}

function Script3()
{
    // debug alert("I'm in trigger");
    // must use variable names, not control names
    // alert(player.GetVar("Name"));
    // build querystring separately, allows careful encoding
    QS = "?" + "Name" + "=" + encodeURIComponent( player.GetVar("Name"));
    // for more args use & instead of ? 
    QS += "&" + "Class" + "=" + encodeURIComponent( player.GetVar("Class"));
    URL = "/AS1Step1.html" + QS,"NameCheck";

    // see http://www.w3schools.com/dom/dom_http.asp
    // and http://www.w3schools.com/dom/tryit.asp?filename=try_dom_xmlhttprequest_first
    xmlhttp = CreateXmlHttp();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            // code will resume here **
            Message = xmlhttp.responseText;
            // alert( "Message=" + Message);
            player.SetVar( "Message", Message);
        }
    }
    xmlhttp.open("GET",URL,true);
    xmlhttp.send();
    // call will stop here but resume behind the scene in **
}
