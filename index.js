$(document).ready(function () {
  var mobileVar = 0;
  var val1 = 2;
  var val2 = 3;
  var screenWidth = window.matchMedia("(max-width: 600px)");
  if (screenWidth.matches) {
    mobileVar = 1;
  }

  var resultArray = {
    headers: [],
    file_data: [],
  };

  function createTable(resultArray) {
    var headLen = resultArray.headers.length;
    $(".table_main").show();
    if (resultArray.file_data.length == 0) {
      $(".table_body").html(
        "<tr><td class='text-center' colspan='11' style='padding:10px;font-size:16px;'>No Data</td></tr>"
      );
      return false;
    }
    if (Array.isArray(resultArray.headers) && resultArray.headers.length != 0) {
      var th_data = "";
      resultArray.headers.forEach((val, i) => {
        th_data += `<th class="text-center ${
          i > 2 && i < 10 ? "head_hide_class" : ""
        }">${val}</th>`;
        if (i == 2) {
          th_data += `<th style="display: none;" class="text-center view_more">...</th>`;
        }
      });
      th_data +=
        "<th class='text-center' style='white-space:nowrap' data-id='edit_row'>Edit</th>";
      $(".table_head_row").html(th_data);
    }

    if (
      Array.isArray(resultArray.file_data) &&
      resultArray.file_data.length != 0
    ) {
      var tr_data = "";
      resultArray.file_data.forEach((item, index) => {
        if (item.length == headLen) {
          var td_data = "";
          item.forEach((val, i) => {
            td_data += `<td class="text-center input-text-center ${
              i > 2 && i < 10 ? "hide_class" : ""
            }">${val}</td>`;

            if (i == 2) {
              td_data += `<td style="display: none;" class="text-center input-text-center view_more">...</td>`;
            }
          });
          tr_data += `<tr class="row_${index + 1}">${td_data}</tr>`;
        }
      });
      $(".table_body").html(tr_data);
    }

    $("#masterSheetTable").SetEditable({
      $addButton: $("#addNewRow"),
      onDelete: function () {
        console.log("delete");
      },

      onEdit: function () {
        console.log("Edit");
      },

      onAdd: function () {
        console.log("Add");
      },
    });
  }

  $("#searchInput").keyup(function () {
    let input = $(this).val();
    let { headers, file_data } = resultArray;
    let result = {
      headers,
      file_data,
    };
    let val = input.toLowerCase();
    result.file_data = val
      ? result?.file_data.filter((v) => {
          return (
            v[0]?.toLowerCase()?.includes(val) ||
            v[1]?.toLowerCase()?.includes(val) ||
            v[2]?.toLowerCase()?.includes(val)
          );
        })
      : result?.file_data;

    createTable(result);
  });

  $(".upload_master_sheet").change(function () {
    var imgData = $(".upload_master_sheet")[0].files[0];

    if (imgData != undefined) {
      var fileType = ["csv", "xsls", "xls", "xlsx"];
      var file_typ = imgData.name.substring(imgData.name.indexOf(".") + 1);

      if (fileType.indexOf(file_typ) < 0) {
        $(".upload_master_sheet").val("");
        alert("file not supported");
        return false;
      }

      var reader = new FileReader();

      reader.onload = function () {
        var fileData = reader.result;
        var wb = XLSX.read(fileData, { type: "binary" });
        wb.SheetNames.forEach(function (sheetName) {
          var csvData = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
          console.log(csvData);
          var temp = csvData.split("\n");
          temp.splice(0, 2);
          var csvData = temp.join("\n");

          var headers = csvData
            .split("\n")[0]
            .replace(/\s/g, " ")
            .trim()
            .split(",");

          headers = headers.filter((v) => v != "");
          var csv_data = csvData.split("\n");
          if (csv_data[0] != "" && csv_data[1] != "") {
            var csvLen = csv_data.length;
            var file_data = [];
            for (var i = 0; i < csvLen; i++) {
              file_data[i] = String(csv_data[i + 1])
                .replace(/\s/g, " ")
                .trim()
                .split(",");
              file_data[i] = file_data[i].filter((v) => v != "");
            }
            resultArray.headers = headers;
            resultArray.file_data = file_data;
          }
        });

        createTable(resultArray);
      };

      reader.readAsBinaryString(imgData);

      setTimeout(() => {
        if (mobileVar == 1) {
          $(".hide_class,.head_hide_class").hide();
          $(".view_more").show();
        }
      }, 10);
    }
  });

  if (mobileVar == 1) {
    function resetTable(row) {
      var getRowClass = row.attr("class");
      $(`.${getRowClass} .hide_class`).hide();
      $(`.${getRowClass}`).css({
        "box-shadow": "unset",
      });
      var trOpen = 0;
      $(".table_body tr").each((i, v) => {
        var getID = $(v).attr("id");
        if (getID && getID == "editing") {
          trOpen = 1;
        }
      });

      if (trOpen) {
        $("#masterSheetTable").css("width", "1100px");
      } else {
        $("#masterSheetTable").css("width", "min-content");
        $(".head_hide_class").hide();
        $(`.view_more`).show();
      }
    }

    $(document).on("click", "#bEdit", function () {
      var getRow = $(this).parents().eq(2);
      var getRowClass = getRow.attr("class");
      $("#masterSheetTable").css("width", "1100px");
      $(`.${getRowClass} .hide_class`).show();
      $(`.${getRowClass}`).css({
        "box-shadow":
          "0 1px 10px rgba(0, 0, 0, 0.2), 0 1px 10px rgba(0, 0, 0, 0.26)",
      });
      $(".head_hide_class").show();
      $(".view_more").hide();
    });

    $(document).on("click", "#bAcep", function () {
      var getRow = $(this).parents().eq(2);
      resetTable(getRow);
    });

    $(document).on("click", "#bCanc", function () {
      var getRow = $(this).parents().eq(2);
      resetTable(getRow);
    });
  }

  $("#download").click(function () {
    var tble = document.getElementById("masterSheetTable");
    var row = tble.rows;

    for (let i = 0; i < row[0].cells.length; i++) {
      var str = row[0].cells[i];
      var id = $(str).data("id");
      if (id == "edit_row") {
        for (var j = 0; j < row.length; j++) {
          row[j].deleteCell(i);
        }
      }
    }

    let table = document.querySelector("#masterSheetTable");
    TableToExcel.convert(table, {
      name: "masterSheet.xlsx",
    });
  });
});
