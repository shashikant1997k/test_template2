$(document).ready(function () {
  var mobileVar = 0;
  var screenWidth = window.matchMedia("(max-width: 600px)");
  if (screenWidth.matches) {
    mobileVar = 1;
  }
  var resultArray = {
    headers: [],
    file_data: [],
  };
  var formData = new FormData();
  var _csvData;

  $("#csvFile").change(function () {
    var imgData = $("#csvFile")[0].files[0];
    formData.append("file", imgData);
    if (imgData != undefined) {
      var fileType = ["csv", "xsls", "xls", "xlsx"];
      var file_typ = imgData.name.substring(imgData.name.lastIndexOf(".") + 1);

      if (fileType.indexOf(file_typ) < 0) {
        $("#csvFile").val("");
        alert("file not supported");
        return false;
      }

      var reader = new FileReader();

      reader.onload = function () {
        var fileData = reader.result;
        var wb = XLSX.read(fileData, { type: "binary" });
        wb.SheetNames.forEach(function (sheetName) {
          let csv_data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
            header: 1,
          });

          _csvData = csv_data.length ? csv_data : _csvData;
        });
        createDummyTable(_csvData);
      };

      reader.readAsBinaryString(imgData);
    }
  });

  function createDummyTable(res) {
    var tData = "";
    var thData = "";
    var optionRow = "";
    if (Array.isArray(res) && res.length) {
      for (var i = 0; i < (res.length >= 8 ? 8 : res.length); i++) {
        tData += `<tr class="option_row" data-id="${i}"><td>${i}</td>`;
        for (var j = 0; j <= res[i].length; j++) {
          tData += `<td class="_data_td${j}">${
            res[i][j] != undefined
              ? res[i][j].length < 20
                ? res[i][j]
                : res[i][j].slice(0, 20) + "..."
              : ""
          }</td>`;
        }

        tData += `</tr>`;
      }
    }
    $("#upload_file").modal("show");
    $(".modal-title").html("Select Column Header Row");
    $(".csv_files").hide();
    $(".csv_dummy_files,.next_btn").show();
    $(".custom_modal .modal-body .csv_dummy_files table tbody").html(
      `${tData}`
    );
  }

  var rowNum = null;
  $(document).on("click", ".option_row", function () {
    rowNum = $(this).data("id");
    $(".error_msg").hide();
    $(".option_row").css({
      background: "#FFF",
      color: "#000",
      "box-shadow": "none",
    });
    $(this).css({
      background: "#35A630",
      color: "#FFF",
      "box-shadow": "0px 0px 5px -1px #35A630",
    });
  });

  $(document).on("click", ".back_btn", function () {
    $("#upload_file").modal("show");
    $(".modal-title").html("Select Header Row");
    $(".csv_files,.back_btn, .submit_btn").hide();
    $(".csv_dummy_files,.next_btn").show();
  });

  $(document).on("click", ".next_btn", function () {
    if (!rowNum) {
      $(".error_msg").show();
      return false;
    }
    if (_csvData.length > 0) {
      var csv1 = [..._csvData[0], ..._csvData[1]];
      csv1 = csv1.filter((v) => v);
      console.log(rowNum);
      var csv2 = [];
      csv1.forEach((v) => {
        csv2.push(v.trim().replace(":", ""));
      });

      var topData = {};
      for (let i = 0; i < csv2.length; i = i + 2) {
        topData[csv2[i]] = csv2[i + 1];
      }

      var headers =
        _csvData[rowNum].length > 0 && _csvData[rowNum].filter((v) => v);
      var temp = _csvData.slice(rowNum + 1, _csvData.length);
      var temp1 = temp[0].filter((v) => v);
      var _len = temp1.length;
      var file_data = [];

      if (Array.isArray(temp) && temp.length > 0) {
        temp.forEach((arr) => {
          if (Array.isArray(arr) && arr.length > 0) {
            var temp2 = arr.filter((v) => v);
            if (temp2.length == _len) {
              file_data.push(temp2);
            }
          }
        });
      }

      resultArray.headers = headers;
      resultArray.file_data = file_data;

      console.log(file_data.length);
    }

    createTable(resultArray);
  });

  // create table from uploaded file data
  function createTable(output) {
    $("#upload_file").modal("show");
    $(".modal-title").html("Row mapping");
    $(".csv_files,.back_btn, .submit_btn").show();
    $(".csv_dummy_files,.next_btn").hide();
    var headers = output.headers || [];
    var file_data = output.file_data || [];
    var tData = "";
    var thData = "";
    var optionRow = "";
    var mobileOptionRow = "";

    var map_array = {
      Category: "category",
      "Item Code": "item_code",
      "Item Name": "item_name",
      "RFA Qty": "rfa_qty",
      "Total Value": "total_value",
      "Salv Qty": "salv_qty",
      UOM: "uom",
      "Salv Value": "salv_value",
      "RFA Value": "rfa_value",
    };

    // headers[j].toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())

    if (Array.isArray(headers) && headers.length) {
      for (var j = 0; j < headers.length; j++) {
        if (headers[j]) {
          if (mobileVar) {
            let mobileSelect = "";
            for (var key in map_array) {
              let con1 = headers[j].toLowerCase().split(" ").join("_");
              mobileSelect += `<option ${
                con1 == map_array[key] ? "selected" : ""
              } value=${map_array[key]} align='center'>${key}</option>`;
            }
            mobileOptionRow = `<div class="_mobile_select_td">
              <div class="_select">
                <select class="form-control mappingVal" id="_select_${j}">
                  <option value="">Select</option>
                  ${mobileSelect}
                </select>
              </div></div>`;

            thData += `<td class='mappedVal' id="_skip_td${j}">
              <div class="mob_head_style">
                <div style="width:60%;display:flex;flex-direction:column;justify-content:space-arround;">
                  <div style="font-weight:600;color:#656565">
                    ${
                      headers[j].length < 20
                        ? headers[j]
                        : headers[j].slice(0, 20) + "..."
                    }
                  </div>
                  <div style="font-weight:500;color:#656565">
                    ${
                      file_data[0][j].length < 20
                        ? file_data[0][j]
                        : file_data[0][j].slice(0, 20) + "..."
                    }
                  </div>
                </div>
                <div styly="width:40%;font-wieght:normal;color:#656565;">
                  ${mobileOptionRow}
                </div>
              </div>
            
               </td> `;
          } else {
            optionRow += `<td class="_data_td${j}"><div class="_select_td">
              <div class="_select">
                <select class="form-control mappingVal" id="_select_${j}">
                  <option value="">Select</option>`;

            for (var key in map_array) {
              let con1 = headers[j].toLowerCase().split(" ").join("_");
              optionRow += `<option ${
                con1 == map_array[key] ? "selected" : ""
              } value=${map_array[key]} align='center'>${key}</option>`;
            }

            optionRow += `</select></div></div></td>`;

            thData += `<th align='center' id="_skip_td${j}" data-value="${
              headers[j]
            }" class="mappedVal">${
              headers[j].length < 20
                ? headers[j]
                : headers[j].slice(0, 20) + "..."
            }
            </th> `;
          }
        }
      }
    }

    if (Array.isArray(file_data) && file_data.length) {
      for (var i = 0; i < (file_data.length > 4 ? 4 : file_data.length); i++) {
        tData += `<tr>`;
        for (var j = 0; j < headers.length; j++) {
          tData += `<td data-label="${
            resultArray.headers[i]
          }" class="_data_td${j}">${
            file_data[i][j] != undefined
              ? file_data[i][j].length < 20
                ? file_data[i][j]
                : file_data[i][j].slice(0, 20) + "..."
              : ""
          }</td>`;
        }

        tData += `</tr>`;
      }
    }

    $(".custom_modal .modal-body .csv_files table thead #thead").html(
      `${thData}`
    );
    $(".custom_modal .modal-body .csv_files table tbody").html(
      `<tr>${optionRow}</tr>${tData}`
    );
  }

  // Submit after mapping the data value
  $(".submit_btn").click(function () {
    var result = {};

    var error_val = 0;
    var input1 = $(".mappedVal");
    var input2 = $(".mappingVal");
    var mappedVal = [];
    var mappingVal = [];

    for (let i = 0; i < input2.length; i++) {
      let v1 = $(input2[i]).find(":selected").val();
      let v2 = $(input1[i]).data("value");
      if (v1 != "") {
        mappingVal.push(v1);
      } else {
        mappingVal.push(v2);
      }
    }
    for (let i = 0; i < input1.length; i++) {
      mappedVal.push($(input1[i]).data("value"));
    }
    mappedVal.forEach((key, i) => {
      if (mappingVal[i] != 1) {
        result[key] = mappingVal[i];
      }
    });

    let footer_start_row = resultArray.file_data.length + rowNum + 2;
    formData.append("footer_start_row", footer_start_row);
    formData.append("row_mapping", JSON.stringify(result));

    for (let [name, value] of formData) {
      console.log(value);
    }
  });

  $("#upload_file").on("hidden.bs.modal", function () {
    $(".modal-title").html("Select Column Header Row");
    $(".csv_files,.csv_dummy_files,.back_btn, .submit_btn,.next_btn").hide();
    $("#csvFile").val("");
  });
});
