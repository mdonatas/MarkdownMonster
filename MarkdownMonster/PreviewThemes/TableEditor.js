var page = {
    tableData: {
        activeCell: { row: 3, column: 1},
        headers: [
            "Header 1",
            "Header 2:"
        ],
        rows: [
            [
                "Col Text 1 1",
                "Col Text 1 2",
            ],
            [
                "Col Text 2 1",
                "Col Text 2 2",
            ],
            [
                "Col Text 3 1",
                "Col Text 3 2",
            ]
        ],

    },
    dotnet: null, 
    mousePos: { x: -1, y: -1, row: -1, col: -1 },
    workElement: null,
    initialize: function() {
        page.workElement = document.createElement("div");

        // handle tab insertion and up down key navigation
        $(document).on("keydown","td textarea,th textarea",page.keydownHandler);

        $(document).on("keyup","#RenderWrapper th textarea", page.headerAlignment);        
        setTimeout(function() { $("th textarea").trigger("keyup"); },10);

      
        $(document).on("mousemove","#RenderWrapper textarea",function(e) {
            page.mousePos.x = e.clientX;
            page.mousePos.y = e.clientY;
        });
        $(document).on("contextmenu","#RenderWrapper textarea",function(e) {                   
            var textBox = e.target;
            if (textBox.tagName != "TEXTAREA") return;
            var pos = page.idToPos(textBox.id);

            pos.x = page.mousePos.x;
            pos.y = page.mousePos.y;
            if (page.dotnet)     
            {                
                page.dotnet.ShowContextMenu(pos);
            }
            else {
                alert(JSON.stringify(pos));
            }
        });       
    },
    keydownHandler: function(e) {
        var text$ = $(this);
        var id = this.id;

        var pos = page.idToPos(id);
        if(pos.row == -1) return;   
        
        // console.log("keyDown Key: " + e.keyCode);
        
        // tab end of list insertion
        if (!e.shiftKey && e.keyCode === 9 && this.parentNode.tagName !== "TH") {                 
            // find next td            
            var $next = $(this).parent().next();                
            if ($next.length > 0)  // not last textarea
                return;

            // find next tr                     
            var tr$ = $(this).parent().parent().next();
            if (tr$.length > 0)  // not last tr
                return;

            var clonedTr$ = $(this).parent().parent().clone();            
            clonedTr$.find("textarea").each(function(i) {                 
                var pos = page.idToPos(  this.id);
                var row = pos.row + 1;
                this.id = "id_" + row + "_" + pos.col;                
                this.value = "";
            });            
            $("tbody").append(clonedTr$);
        }

        // down key navigates
        else if (e.keyCode == 40) 
        {
            var hasReturns = this.value.indexOf("\n") > 0;
            if ((hasReturns && !e.ctrlKey)) return false;  // line breaks - don't use arrows

            var newRow = pos.row + 1;
            var newId = "#id_" + newRow + "_" + pos.col;
            $(newId).focus();
            return false;
        }

        // up key navigation
        else if (e.keyCode == 38) 
        {                    
            var hasReturns = this.value.indexOf("\n") > 0;
            if (pos.row < 1 || (hasReturns && !e.ctrlKey) ) return false;  

            var newRow = pos.row - 1;
            var newId = "#id_" + newRow + "_" + pos.col;
            $(newId).focus();
            return false;
        }               
    },

    headerAlignment: function() {
        var el$ = $(this);
        var text = el$.val();
        
        var pos = page.idToPos(this.id);
        if (pos.row !== 0) return;

        var col = pos.col + 1;
        var cols$ = $("#RenderWrapper thead th:nth-child(" +col + ") textarea," +
                      "#RenderWrapper tbody td:nth-child(" + col + ") textarea");

        cols$.removeClass("center-align");
        cols$.removeClass("right-align");
                 
        if(text[text.length-1] == ":" && text[0] == ":") {                               
            cols$.addClass("center-align");
        }  
        if(text[text.length-1] == ":") {                               
            cols$.addClass("right-align");
        }   
        
    },
    renderTable: function() {
        var html = "<table>\n";
        var headers = page.tableData.headers;

        // row 0
        if (headers && headers.length > 0) {
            html += "<thead>\n<tr>"

            for (let i = 0; i < headers.length; i++) {
                var colText = headers[i];              
                var c =  i;  
                html += "<th><textarea id='id_0_" + c  + "'>" + page.encodeText(colText) + "</textarea></th>";                
            }
            html += "</tr>\n</thead>"
        }

        // content rows are 1 based to account for row ids
        var rows = page.tableData.rows;
        if(rows && rows.length > 0)
        {
            html += "<tbody>\n"

            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                var rowArray = rows[rowIdx];
                html += "<tr>\n"
    
                for (var colIdx = 0; colIdx < rowArray.length; colIdx++) {
                    var colText = rowArray[colIdx];
                    var r = rowIdx * 1 + 1;
                    var c = colIdx * 1;                    
                    html += "<td><textarea id='id_" + r  + "_" +  c +  "'>" + page.encodeText(colText) + "</textarea></td>\n";                                
                }

                html += "</tr>\n"
            }
            html += "</tbody>"
        }

        html += "</table>";
        $("#RenderWrapper").html(html);
        
        if (page.tableData.activeCell) {
            var sel = "#row" + page.tableData.activeCell.row + "_col" + page.tableData.activeCell.column;
            console.log(sel);
            $(sel).focus();
        }
    },
    parseTable: function() {
        var td = {
            activeCell: { row: 3, column: 1},
            headers: [],
            rows: [] 
        };
        $("#RenderWrapper thead th textarea").each(function(i) {
            td.headers[i] = this.value;
        });
        $("#RenderWrapper tbody tr").each(function(i) {            
            var row = [];
            $(this).find("textarea").each(function(x) {
                row[x] = this.value;
            });
            td.rows[i] = row;            
        });

        page.tableData = td;        
        return td;
    },

    idToPos: function(id) {
        var pos = { row: -1, col: -1};

        var id = id.replace("id_","");
        var tokens = id.split("_");
        if (tokens.length < 2) return pos;
           
        pos.row = tokens[0] * 1;
        pos.col = tokens[1] * 1;
        return pos;
    },
    encodeText: function(text) {
        page.workElement.innerText = text;
        return page.workElement.innerHTML;
    }



};  // page



page.initialize();
page.renderTable();




function InitializeInterop(dotnet, tableDataJson) {        
    page.dotnet = dotnet;
    page.tableData = JSON.parse(tableDataJson);
    page.renderTable();

    
}
