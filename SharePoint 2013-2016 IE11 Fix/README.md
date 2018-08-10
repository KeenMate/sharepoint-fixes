# SharePoint 2013/2016 Internet Explorer 11(IE11) Drag'n'drop fix

## What is it about
As you've already found out drag and drop in SharePoint 2016 is not working when you set ***X-UA-Compatible*** to value *IE=Edge* you won't be able to drag and drop webparts in *design* mode.

At first we thought it's going to be pain in the ass to fix that and we are lost forever because Microsoft has not fixed this error in like six years but as it turns out the fixes were actually quite trivial. 

All we had to do were these three fixes:
- In method *MSOLayout_MoveWebPartStart* replace *1* with *0*
``` if (window.event == null || window.event.button != 0) ```
- In the same method add simple check for undefined
``` 	if(document.selection) document.selection.empty(); ```
- And lastly in method *MSOLayout_MoveWebPart* remove condition on *good_drop*
```if (MSOLayout_currentDragMode != 'move' || MSOLayout_iBar.getAttribute('goodDrop') != 'true' || OriginalZoneCell == DestinationZoneCell)```

The *ie55up.debug-fix.js* file contains replacements of the two touched methods in ie55up.debug.js

The *ie55up.fix.js* file contains minified replacements of the two touched methods in ie55up.js

## How to use the files
Places these two files into your master page just behind ie55.js reference and that's it. 

Let us know if there are some issues with it? We have not find any though.
