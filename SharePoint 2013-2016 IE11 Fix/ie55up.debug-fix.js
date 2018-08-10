function MSOLayout_MoveWebPartStart(e, ZoneWPCell, WebPartCaption, Gallery) {
    if (window.event == null || window.event.button != 0)
        return;
    MSOLayout_currentDragMode = 'move';
	if(document.selection)
		document.selection.empty();
    MSOLayout_galleryView = Gallery == true ? true : false;
    MSOLayout_CreateDragObject(WebPartCaption);
    MSOLayout_CreateIBar();
    MSOLayout_oDropLocation = ZoneWPCell;
    var allowZoneChange = ZoneWPCell.getAttribute('allowZoneChange');

    if (allowZoneChange == '0')
        MSOLayout_maintainOriginalZone = MSOLayout_GetParentWPZoneDiv(ZoneWPCell);
    else
        MSOLayout_maintainOriginalZone = '0';
    var zoneid = ZoneWPCell.getAttribute('zoneid');

    if (MSOLayout_galleryView && typeof ZoneWPCell.dzc != "undefined" && ZoneWPCell.dzc != null) {
        var zones = GetElementsByName('MSOZone');

        if (zones != null && zones.length > 1) {
            for (var i = 0; i < zones.length; i++) {
                if (zones[i].zoneID == zoneid) {
                    MSOLayout_maintainOriginalZone = zones[i];
                    break;
                }
            }
        }
    }
    MSOLayout_iBar.setAttribute('goodDrop', 'false');
    var zone = MSOLayout_GetParentWPZoneDiv(ZoneWPCell);

    if (zone.id == 'MSOZone') {
        MSOLayout_zoneDragOver = zone;
        Sys.UI.DomElement.addCssClass(MSOLayout_zoneDragOver, "ms-SPZoneSelected");
    }
    if (!MSOLayout_galleryView && !MSOLayout_IsWikiEditMode()) {
        MSOLayout_MoveIBar(ZoneWPCell);
    }
    AddEvtHandler(document.body, 'ondragover', MSOLayout_MoveWebPartBodyDragOver);
    if (typeof document.body.ondragend != "undefined")
        var oldDragEnd = document.body.ondragend;
    if (typeof document.body.ondrop != "undefined")
        var oldDrop = document.body.ondrop;
    document.body.ondragend = new Function("window.event.returnValue = false;");
    document.body.ondrop = new Function("MSOLayout_iBar.setAttribute('goodDrop', 'true')");
    ZoneWPCell.ondragstart = new Function("try {event.dataTransfer.effectAllowed = 'move';} catch (exception) {}");
    AddEvtHandler(ZoneWPCell, 'ondrag', MSOLayout_MoveDragObject);
    ZoneWPCell.dragDrop();
    DetachEvent('dragover', MSOLayout_MoveWebPartBodyDragOver, document.body);
    document.body.ondragend = oldDragEnd;
    document.body.ondrop = oldDrop;
    DetachEvent("drag", MSOLayout_MoveDragObject, ZoneWPCell);
    MSOLayout_moveObject.style.display = 'none';
    MSOLayout_currentDragMode = "";
    event.returnValue = false;
}

function MSOLayout_MoveWebPart(OriginalZoneCell, DestinationZoneCell) {
    MSOLayout_iBar.style.display = 'none';
    Sys.UI.DomElement.removeCssClass(MSOLayout_zoneDragOver, "ms-SPZoneSelected");
    //if (MSOLayout_currentDragMode != 'move' || MSOLayout_iBar.getAttribute('goodDrop') != 'true' || OriginalZoneCell == DestinationZoneCell)
	if (MSOLayout_currentDragMode != 'move' || OriginalZoneCell == DestinationZoneCell)
        return;
    var newTableCell;
    var originalZone = MSOLayout_GetParentWPZoneDiv(OriginalZoneCell);
    var originalIndex;
    var originalOrientation = OriginalZoneCell.getAttribute('orientation');

    originalIndex = MSOLayout_CalculateZoneCellIndex(OriginalZoneCell);
    var destinationZone;
    var destinationIndex;

    destinationZone = MSOLayout_GetParentWPZoneDiv(DestinationZoneCell);
    var zonesChanged = destinationZone != originalZone;
    var destinationOrientation = DestinationZoneCell.getAttribute('orientation');

    destinationIndex = MSOLayout_CalculateZoneCellIndex(DestinationZoneCell);
    var zoneCellPlaceHolder = document.createElement('div');

    DestinationZoneCell.parentNode.insertBefore(zoneCellPlaceHolder, DestinationZoneCell);
    zoneCellPlaceHolder.swapNode(OriginalZoneCell);
    zoneCellPlaceHolder.removeNode(true);
    OriginalZoneCell.setAttribute('orientation', destinationOrientation);
    if (zonesChanged) {
        var originalEmptyZoneText = getFirstElementByName(originalZone, 'MSOZoneCell_emptyZoneText');
        var destinationEmptyZoneText = getFirstElementByName(destinationZone, 'MSOZoneCell_emptyZoneText');

        if (originalEmptyZoneText != null) {
            var strNumWebParts = originalEmptyZoneText.getAttribute('webPartsInZone');

            if (strNumWebParts != null) {
                var numWebParts = Number(strNumWebParts);

                numWebParts--;
                if (numWebParts == 0) {
                    originalEmptyZoneText.style.display = '';
                    originalEmptyZoneText.parentNode.style.padding = '';
                }
                originalEmptyZoneText.setAttribute('webPartsInZone', String(numWebParts));
            }
        }
        if (destinationEmptyZoneText != null) {
            var strDestNumWebParts = destinationEmptyZoneText.getAttribute('webPartsInZone');

            if (strDestNumWebParts != null) {
                var numDestWebParts = Number(strDestNumWebParts);

                numDestWebParts++;
                destinationEmptyZoneText.setAttribute('webPartsInZone', String(numDestWebParts));
            }
            destinationEmptyZoneText.style.display = 'none';
            destinationEmptyZoneText.parentNode.style.padding = '0';
        }
    }
    if (zonesChanged || destinationIndex != originalIndex && destinationIndex != originalIndex + 1) {
        if (originalZone != destinationZone) {
            var destZoneId = destinationZone.getAttribute('zoneID');
            var relatedWebPart = OriginalZoneCell.getAttribute('relatedwebpart');

            if (relatedWebPart != null && destZoneId != null)
                MSOLayout_AddChange(eval(relatedWebPart), "Zone", destZoneId);
            MSOLayout_UpdatePartOrderAfterMove(originalZone, 0);
        }
        MSOLayout_UpdatePartOrderAfterMove(destinationZone, 0);
    }
    if (zonesChanged) {
        if (destinationOrientation == 'Horizontal') {
            MSOLayout_AdjustHorizontalZoneCells(destinationZone);
        }
        else {
            Sys.UI.DomElement.removeCssClass(OriginalZoneCell, "ms-webpart-cell-horizontal");
        }
    }
}