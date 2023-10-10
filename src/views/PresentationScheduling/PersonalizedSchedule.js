import { React, useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import axios from "axios";
import moment from "moment";
import jwt_decode from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, CircularProgress, Divider, FormControl, InputLabel, MenuItem, Popover, Select, Stack, Typography } from "@mui/material";
import { DataGrid, gridClasses, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ margin: "0 5px 5px 0" }}>
      <GridToolbarFilterButton sx={{ fontSize: "16px", color: "black" }} />
    </GridToolbarContainer>
  );
}

function PersonalizedSchedule() {

  const [token, setToken] = useCookies();
  const [isLoading, setLoading] = useState(false);
  
  const [csmindSelection, setCsmindSelection] = useState([]);
  const [selectedCsmind, setSelectedCsmind] = useState();
  const [slots, setSlots] = useState([]);
  const [dayOfSlots, setDayOfSlots] = useState([]);
  const [dayDate, setDayDate] = useState([]);
  const [userId, setUserId] = useState(0);
  
  const [pageSize, setPageSize] = useState(10);
  const [presentations, setPresentations] = useState([]);
  const [students, setStudents] = useState([]);

  const getRowId = (params) => params.id;

  const columns = [
    { field: "presIdentity", headerName: "#", description: "#", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "matricNum",
      headerName: "Matric No.",
      description: "Matric No.",
      flex: 1,
      headerAlign: "center", 
      align: "center",
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { students.find( (s) => s.user.id === cellValues.row.student.id).matricNum }
          </span>
        );
      },
    },
    {
      field: "student",
      headerName: "Student",
      description: "Student",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.student.name) }
          </span>
        );
      },
    },
    { field: "title", headerName: "Title", description: "Title", flex: 3,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.value) }
          </span>
        );
      },
    },
    {
      field: "supervisor",
      headerName: "Supervisor",
      description: "Supervisor",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.supervisor.name) }
          </span>
        );
      },
    },
    {
      field: "examinerOne",
      headerName: "Examiner",
      description: "Examiner",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.examinerOne.name) }
          </span>
        );
      },
    },
    {
      field: "examinerTwo",
      headerName: "Chair",
      description: "Chair",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.examinerTwo.name) }
          </span>
        );
      },
    },
    {
      field: "venue",
      headerName: "Time & Venue",
      description: "Time & Venue",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            {cellValues.row.timeSlot}
            <br></br>
            {cellValues.row.day}
            <br></br>
            {cellValues.row.date}
            <br></br>
            {cellValues.row.venue}
          </span>
        );
      },
    }
  ];

  const fetchPresentations = async () => {
    setLoading(true);
    let formData = new FormData();
    formData.append("userId", userId);

    await axios
      .put( API_URL + "/api/v1/presentation/user/" + selectedCsmind.id, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setPresentations(data.presentations);
        setStudents(data.students);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchUserCsminds = async () => {
    await axios
      .get( API_URL + "/api/v1/csmind/getUserCsminds/" + userId, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCsmindSelection(data);
        setSelectedCsmind(data[0]);
        if(data[0].schedule !== null)
          setSlots(JSON.parse(data[0].schedule));
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if(userId !== 0) {
      fetchUserCsminds();
    }
  }, [userId]);

  useEffect(() => {
    if(token['Token']) {
      const decoded = jwt_decode(token['Token']);
      setUserId(decoded.userInfo.id);
    }
  }, [token]);

  useEffect(() => {
    if(selectedCsmind && userId !== 0) {
      fetchPresentations();
    }
  }, [selectedCsmind]);

  useEffect(() => {
    if (slots.length > 0 && presentations.length > 0) {
      var size = (slots[slots.length-1].row + 1) * 16;
      var numOfDay = (slots.length / 16) / (slots[slots.length-1].row + 1);
      var dos = [];
      var dayDate = [];
      let newArr = [...slots];

      for (let i = 0; i < slots.length; i++) {
        let include = false;
        
        for (let j = 0; j < presentations.length; j++) {
          if (slots[i].row === 0 || slots[i].column === 0 ) {
            break;
          }
          
          if (slots[i].header === presentations[j].presIdentity) {
            include = true;
            break;
          }
        }

        if (slots[i].row !== 0 && slots[i].column !== 0 && !include ) {
          newArr[i].header = "";
          newArr[i].flag = false;
        }
      }

      setSlots(newArr);
      
      for (var i=0; i < newArr.length; i+=size) {
        dos.push(newArr.slice(i,i+size));
      }

      for (var i=0; i < numOfDay; i++) {
        var tomorrow = new Date(selectedCsmind.startDate);
        tomorrow.setDate(tomorrow.getDate()+i);
        dayDate.push(moment(tomorrow).format("DD MMM YYYY, ") + tomorrow.toLocaleString("en", { weekday: "long" }));
      }

      setDayOfSlots(dos);
      setDayDate(dayDate);
    }
  }, [presentations]);

  const onExportPdf = () => {
    if (dayOfSlots.length > 0) {

      const doc = new jsPDF('l', 'pt', 'a4');
      let firstPage = true;

      for (let i = 0; i < dayOfSlots.length; i++) {

        const data = presentations.filter(p => `${p.date}, ${p.day}` === dayDate[i]).map(elt=> [elt.presIdentity, students.find( (s) => s.user.id === elt.student.id).matricNum, elt.student.name, elt.title, elt.supervisor.name, elt.examinerOne.name, elt.examinerTwo.name, `${elt.timeSlot}\n${elt.venue}\n${elt.date}\n${elt.day}`]);

        const input = document.getElementById(`mySchedule_${i}`);
        html2canvas(input)
          .then((canvas) => {
            const image = canvas.toDataURL('image/png', 1.0);

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const widthRatio = pageWidth / canvas.width;
            const heightRatio = pageHeight / canvas.height;
            const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;
    
            const canvasWidth = canvas.width * ratio;
            const canvasHeight = canvas.height * ratio;
    
            const marginX = (pageWidth - canvasWidth) / 2;
            const marginY = (pageHeight - canvasHeight) /2;
    
            if(data.length > 0) {
              if(!firstPage) {
                doc.addPage();
              }
              firstPage = false;
              doc.text('CSMInD Session', (pageWidth / 2), marginY-80, 'center');
              doc.text(`Academic Year ${selectedCsmind.academicSession.academicSession}`, (pageWidth / 2), marginY-60, 'center');
              doc.text(`Semester ${selectedCsmind.academicSession.semester}`, (pageWidth / 2), marginY-40, 'center');
              doc.text(`${dayDate[i]}`, (pageWidth / 2), marginY-10, 'center');
              doc.addImage(image, 'PNG', marginX, marginY, canvasWidth, canvasHeight);

              const headers = [["#", "Matric No.", "Student", "Title", "Supervisor", "Examiner", "Chair", "Time & Venue"]];
              let content = {
                startY: marginY + 1000,
                head: headers,
                body: data,
                rowPageBreak: 'auto',
                margin: 5,
                columnStyles: {
                  7: {cellWidth: 100}
                }
              };
              doc.autoTable(content);
            }

            if(i === dayOfSlots.length-1) {
              if(dayOfSlots.length > 1) {
                doc.save(`My Schedule ${dayDate[0]} - ${dayDate[dayOfSlots.length-1]}.pdf`);
              }
              else {
                doc.save(`My Schedule ${dayDate[0]}.pdf`);
              }
            }
        });
      }
    }
  }

  // Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverItem, setHoverItem] = useState("");
  const [hoverItemDetails, setHoverItemDetails] = useState({
    identity: "",
    title: "",
    studentName: "",
    supervisorName: "",
    examinerName: "",
    chairName: ""
  });
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event, slotHeader) => {
    setAnchorEl(event.currentTarget);
    setHoverItem(slotHeader);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoverItem("");
    setHoverItemDetails({
      identity: "",
      title: "",
      studentName: "",
      supervisorName: "",
      examinerName: "",
      chairName: ""
    });
  };

  useEffect(() => {
    if(hoverItem !== "") {
      var hoverDetails = presentations.find(item => item.presIdentity === hoverItem);
      setHoverItemDetails({
        identity: hoverDetails.presIdentity,
        title: hoverDetails.title,
        studentName: hoverDetails.student.name,
        supervisorName: hoverDetails.supervisor.name,
        examinerName: hoverDetails.examinerOne.name,
        chairName: hoverDetails.examinerTwo.name
      });
    }
  }, [hoverItem]);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Personalized Schedule</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center" gap={3} sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", paddingLeft: "5px" }}
            >
              My Schedule
            </Typography>
            <Button
              disabled={ selectedCsmind && selectedCsmind.schedule !== null ? false : true }
              variant="contained"
              onClick={onExportPdf}
            >
              Export To PDF
            </Button>
          </Stack>
          <div style={{ paddingLeft: "5px" }}>
            <InputLabel>Choose a CSMInD session</InputLabel>
            <FormControl style={{width: '50%'}}>
              <Select
                id="csmind"
                sx={{
                  marginBottom: "10px",
                }}
                value={selectedCsmind == null ? "" : selectedCsmind.id}
                MenuProps={MenuProps}
                onChange={(e) => {
                  let selected = csmindSelection.find((element) => {
                    return element.id === e.target.value;
                  })
                  setSelectedCsmind(selected)
                  if(selected.schedule !== null) {
                    setSlots(JSON.parse(selected.schedule));
                  }
                  else {
                    let temp = [];
                    setSlots(temp);
                    setDayOfSlots(temp);
                    setDayDate(temp);
                  }
                }}
              >
                {
                  csmindSelection && csmindSelection.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{moment(item.startDate).format("DD-MMM-YYYY")}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </div>
          <Divider sx={{ mt: 3, mb: 3 }}/>
          {
            dayOfSlots.length > 0 ?
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                CSMInD Session
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                Academic Year {selectedCsmind.academicSession.academicSession}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                Semester {selectedCsmind.academicSession.semester}
              </Typography>
              {
                dayOfSlots.map( (dos, i) => (
                  <>
                    <Typography sx={{ fontWeight: "bold", mt: 3, fontSize: 18, textAlign: 'center' }}>{ dayDate[i] }</Typography>
                    <div className="table-responsive ps-2 pe-2" style={{ marginTop: '10px' }} id={`mySchedule_${i}`}>
                      <table className="table table-bordered" style={{ border: '1px solid black' }}>
                        <thead>
                          <tr>
                          {
                            dos.filter(s => s.row === 0 ).map( (item, index) => {
                              if(item.header.includes('x')) {
                                return <th key={index} style={{ textAlign: 'center' }}>x</th>
                              }
                              else {
                                return <th key={index} style={{ textAlign: 'center' }}>{item.header}</th>
                              }
                            })
                          }
                          </tr>
                        </thead>
                        <tbody>
                          {
                            dos.filter(s => s.row !== 0 && s.column === 0 ).map( (item, row) => (
                              <tr key={row}>
                                {
                                  dos.filter(s => s.row === row+1 ).map( (slot, column) => {
                                    if(column === 0) {
                                      return <th key={column} style={{ textAlign: 'center' }}>{slot.header}</th>
                                    }
                                    else {
                                      return <td key={column} style={{ verticalAlign: 'middle', textAlign: 'center', border: '1px solid black', backgroundColor: slot.flag ? '#DEDEDE' : 'white' }}>
                                        <Typography
                                          aria-owns={open ? 'mouse-over-popover' : undefined}
                                          aria-haspopup="true"
                                          onMouseOver={ (event) => { handlePopoverOpen(event, slot.header) }}
                                          onMouseOut={handlePopoverClose}
                                        >
                                          { slot.header }
                                        </Typography>
                                      </td>
                                    }
                                  })
                                }
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                  </>
                ))
              }
            </> : 
            <Typography variant="subtitle1" sx={{ mt: 4, textAlign: "center" }}>
              Schedule Not Available
            </Typography>
          }
          <Divider sx={{ mt: 4, mb: 3 }}/>
          {
            isLoading ? 
            (
              <div style={{ textAlign: "center" }}>
                <CircularProgress />
              </div>
            ) : 
            (
              <DataGrid
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                getRowHeight={() => "auto"}
                autoHeight={true}
                getRowId={getRowId}
                rows={presentations}
                columns={columns}
                rowsPerPageOptions={[10, 50, 100]}
                disableColumnMenu={true}
                disableSelectionOnClick
                components={{ Toolbar: CustomToolbar }}
                componentsProps={{
                  panel: {
                    placement: "top",
                  },
                }}
                sx={{
                  ".MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold !important",
                    overflow: "hidden !important",
                    fontSize: "16px",
                    textOverflow: "ellipsis",
                  },
                  [`& .${gridClasses.cell}`]: {
                    py: 2,
                  },
                  ".MuiTablePagination-displayedRows": {
                    marginTop: "1em",
                    marginBottom: "1em",
                  },
                  ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
                    {
                      marginTop: "1em",
                      marginBottom: "1em",
                    },
                  border: "none",
                }}
              />
            )
          }
        </div>
      </div>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none'
        }}
        PaperProps={{
          style: { 
            width: '20%',
            backgroundColor: '#03A9F3',
            color: 'white'
          },
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <div className="d-flex row">
          <div className="col-sm-12 col-md-4">
            <Typography sx={{ p: 1, fontSize: '12px', fontWeight: 'bold' }}>Identifier: </Typography>
          </div>
          <div className="col-sm-12 col-md-8">
            <Typography sx={{ p: 1, fontSize: '12px' }}>{ hoverItemDetails.identity }</Typography>
          </div>
        </div>
        <div className="d-flex row">
          <div className="col-sm-12 col-md-4">
            <Typography sx={{ p: 1, fontSize: '12px', fontWeight: 'bold' }}>Student: </Typography>
          </div>
          <div className="col-sm-12 col-md-8">
            <Typography sx={{ p: 1, fontSize: '12px' }}>{ CapitalizeWord(hoverItemDetails.studentName) }</Typography>
          </div>
        </div>
        <div className="d-flex row">
          <div className="col-sm-12 col-md-4">
            <Typography sx={{ p: 1, fontSize: '12px', fontWeight: 'bold' }}>Title: </Typography>
          </div>
          <div className="col-sm-12 col-md-8">
            <Typography sx={{ p: 1, fontSize: '12px' }}>{ CapitalizeWord(hoverItemDetails.title) }</Typography>
          </div>
        </div>
        <div className="d-flex row">
          <div className="col-sm-12 col-md-4">
            <Typography sx={{ p: 1, fontSize: '12px', fontWeight: 'bold' }}>Supervisor: </Typography>
          </div>
          <div className="col-sm-12 col-md-8">
            <Typography sx={{ p: 1, fontSize: '12px' }}>{ CapitalizeWord(hoverItemDetails.supervisorName) }</Typography>
          </div>
        </div>
        <div className="d-flex row">
          <div className="col-sm-12 col-md-4">
            <Typography sx={{ p: 1, fontSize: '12px', fontWeight: 'bold' }}>Examiner: </Typography>
          </div>
          <div className="col-sm-12 col-md-8">
            <Typography sx={{ p: 1, fontSize: '12px' }}>{ CapitalizeWord(hoverItemDetails.examinerName) }</Typography>
          </div>
        </div>
        <div className="d-flex row">
          <div className="col-sm-12 col-md-4">
            <Typography sx={{ p: 1, fontSize: '12px', fontWeight: 'bold' }}>Chair: </Typography>
          </div>
          <div className="col-sm-12 col-md-8">
            <Typography sx={{ p: 1, fontSize: '12px' }}>{ CapitalizeWord(hoverItemDetails.chairName) }</Typography>
          </div>
        </div>
      </Popover>
    </>
  );
}

export default PersonalizedSchedule;


