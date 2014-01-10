function ExecuteScript(strId)
{
  switch (strId)
  {
      case "6QJMbcqSNyC":
        Script1();
        break;
  }
}

function Script1()
{
  QS = "?" + "Var1" + "=" + encodeURIComponent( player.GetVar("Var1"));
  QS += "&" + "Var2" + "=" + encodeURIComponent( player.GetVar("Var2"));
  URL="/auth/twitter" + QS;
  var newWin=window.open( URL, "_self");
}
