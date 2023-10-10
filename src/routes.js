// Layout Types
import { BaseLayout } from "./layouts";

// Route Views
import Profile from "./views/Profile/Profile";
import Dashboard from "./views/Dashboard/Dashboard";
import UserManagement from "./views/UserManagement/UserManagement";
import CreateUser from "./views/UserManagement/Create";
import EditUser from "./views/UserManagement/Edit";
import AssessorManagement from "./views/AssessorManagement/AssessorManagement";
import EditAssessor from "./views/AssessorManagement/Edit";
import ReportRepository from "./views/ReportRepository/ReportRepository";
import ReportDetails from "./views/ReportRepository/ReportDetails";
import Projects from "./views/HostingPlacement/Projects";
import CreatePracticumProject from "./views/HostingPlacement/CreatePracticumProject.";
import ApplicationStatus from "./views/HostingPlacement/ApplicationStatus";
import ConstraintsManagement from "./views/ConstraintsManagement/ConstraintsManagement";
import CreateConstraint from "./views/ConstraintsManagement/Create.js";
import EditConstraint from "./views/ConstraintsManagement/Edit.js";
import EditVenue from "./views/ConstraintsManagement/EditVenue.js";
import MasterSchedule from "./views/PresentationScheduling/MasterSchedule";
import EditMasterSchedule from "./views/PresentationScheduling/EditMasterSchedule";
import PersonalizedSchedule from "./views/PresentationScheduling/PersonalizedSchedule";
import MenteeSchedule from "./views/PresentationScheduling/MenteeSchedule";
import Scheduler from "./views/PresentationScheduling/Scheduler.js";
import Csmind from "./views/Csmind/Csmind";
import CreateCsmind from "./views/Csmind/Create";
import EditCsmind from "./views/Csmind/Edit";
import Presentation from "./views/Presentation/Presentation";
import CreatePresentation from "./views/Presentation/Create";
import EditPresentation from "./views/Presentation/Edit";
import CompanyManagement from "./views/CompanyManagement/CompanyManagement";
import CreateCompany from "./views/CompanyManagement/Create";
import EditCompany from "./views/CompanyManagement/Edit";
import ReportManagement from "./views/ReportManagement/ReportManagement";
import SubmissionStatus from "./views/SubmissionStatus/SubmissionStatus";
import ReportRequest from "./views/ReportRequest/ReportRequest";
import AcademicSession from "./views/Setting/AcademicSession/AcademicSession";
import CreateAcademicSession from "./views/Setting/AcademicSession/Create";
import EditAcademicSession from "./views/Setting/AcademicSession/Edit";
import ReportType from "./views/Setting/ReportType/ReportType";
import CreateReportType from "./views/Setting/ReportType/Create";
import EditReportType from "./views/Setting/ReportType/Edit";
import PublishReport from "./views/Setting/PublishReport/PublishReport";
import EditPublishReport from "./views/Setting/PublishReport/Edit";
import ReportAccess from "./views/Setting/ReportAccess/ReportAccess";
import AcceptRequest from "./views/Setting/ReportAccess/Accept";
import EditReportAccess from "./views/Setting/ReportAccess/Edit";
import Supervisor from "./views/StudentSubmission/Supervisor/Supervisor";
import Examiner from "./views/StudentSubmission/Examiner/Examiner";
import Panel from "./views/StudentSubmission/Panel/Panel";
import Host from "./views/StudentSubmission/Host/Host";
import ViewStudentReport from "./views/StudentSubmission/StudentReport";
import ResumeRepository from "./views/ResumeRepository/ResumeRepository";
import CreateResume from "./views/ResumeRepository/CreateResume";
import EditResume from "./views/ResumeRepository/EditResume";
//based on roles
import MyConstraint from "./views/ConstraintsManagement/MyConstraint";
import EditMyConstraint from "./views/ConstraintsManagement/EditMyConstraint";
import CreateMyConstraint from "./views/ConstraintsManagement/CreateMyConstraint";
import EditPracticumProject from "./views/HostingPlacement/EditPracticumProject";
import PracticumProjectDetail from "./views/HostingPlacement/PracticumProjectDetail";

var routes = [
  {
    path: "/profile",
    layout: BaseLayout,
    component: Profile,
    roles: "Admin,Lecturer,Student,Host",
  },
  {
    path: "/dashboard",
    layout: BaseLayout,
    component: Dashboard,
    roles: "Admin,Lecturer",
  },
  {
    path: "/createuser",
    layout: BaseLayout,
    component: CreateUser,
    roles: "Admin",
  },
  {
    path: "/edituser/:id",
    layout: BaseLayout,
    component: EditUser,
    roles: "Admin",
  },
  {
    path: "/usermanagement",
    layout: BaseLayout,
    component: UserManagement,
    roles: "Admin",
  },
  {
    path: "/companymanagement",
    layout: BaseLayout,
    component: CompanyManagement,
    roles: "Admin",
  },
  {
    path: "/createcompany",
    layout: BaseLayout,
    component: CreateCompany,
    roles: "Admin",
  },
  {
    path: "/editcompany/:id",
    layout: BaseLayout,
    component: EditCompany,
    roles: "Admin",
  },
  {
    path: "/assessormanagement",
    layout: BaseLayout,
    component: AssessorManagement,
    roles: "Admin",
  },
  {
    path: "/editassessor/:id",
    layout: BaseLayout,
    component: EditAssessor,
    roles: "Admin",
  },
  {
    path: "/reportrepository",
    layout: BaseLayout,
    component: ReportRepository,
    roles: "Admin,Lecturer,Student",
  },
  {
    path: "/reportdetails/:id",
    layout: BaseLayout,
    component: ReportDetails,
    roles: "Admin,Lecturer,Student",
  },
  {
    path: "/hostingplacement/projects",
    layout: BaseLayout,
    component: Projects,
    roles: "Admin,Lecturer,Student,Host",
  },
  {
    path: "/createpracticumproject",
    layout: BaseLayout,
    component: CreatePracticumProject,
    roles: "Admin,Lecturer,Host",
  },
  {
    path: "/editpracticumproject/:id",
    layout: BaseLayout,
    component: EditPracticumProject,
    roles: "Admin,Lecturer,Host",
  },
  {
    path: "/practicumprojectdetail/:id",
    layout: BaseLayout,
    component: PracticumProjectDetail,
    roles: "Admin,Lecturer,Student,Host",
  },
  {
    path: "/hostingplacement/applicationstatus",
    layout: BaseLayout,
    component: ApplicationStatus,
    roles: "Admin,Student,Host",
  },
  {
    path: "/reportmanagement",
    layout: BaseLayout,
    component: ReportManagement,
    roles: "Student",
  },
  {
    path: "/submissionstatus",
    layout: BaseLayout,
    component: SubmissionStatus,
    roles: "Student",
  },
  {
    path: "/reportrequest",
    layout: BaseLayout,
    component: ReportRequest,
    roles: "Lecturer,Student",
  },
  {
    path: "/setting/academicsession",
    layout: BaseLayout,
    component: AcademicSession,
    roles: "Admin",
  },
  {
    path: "/createacademicsession",
    layout: BaseLayout,
    component: CreateAcademicSession,
    roles: "Admin",
  },
  {
    path: "/editacademicsession/:id",
    layout: BaseLayout,
    component: EditAcademicSession,
    roles: "Admin",
  },
  {
    path: "/setting/reporttype",
    layout: BaseLayout,
    component: ReportType,
    roles: "Admin",
  },
  {
    path: "/createreporttype",
    layout: BaseLayout,
    component: CreateReportType,
    roles: "Admin",
  },
  {
    path: "/editreporttype/:id",
    layout: BaseLayout,
    component: EditReportType,
    roles: "Admin",
  },
  {
    path: "/setting/reportaccess",
    layout: BaseLayout,
    component: ReportAccess,
    roles: "Admin",
  },
  {
    path: "/acceptrequest/:id",
    layout: BaseLayout,
    component: AcceptRequest,
    roles: "Admin",
  },
  {
    path: "/editreportaccess/:id",
    layout: BaseLayout,
    component: EditReportAccess,
    roles: "Admin",
  },
  {
    path: "/setting/publishreport",
    layout: BaseLayout,
    component: PublishReport,
    roles: "Admin",
  },
  {
    path: "/editpublishreport/:id",
    layout: BaseLayout,
    component: EditPublishReport,
    roles: "Admin",
  },
  {
    path: "/studentsubmission/supervisor",
    layout: BaseLayout,
    component: Supervisor,
    roles: "Lecturer",
  },
  {
    path: "/studentsubmission/examiner",
    layout: BaseLayout,
    component: Examiner,
    roles: "Lecturer",
  },
  {
    path: "/studentsubmission/panel",
    layout: BaseLayout,
    component: Panel,
    roles: "Lecturer",
  },
  {
    path: "/studentsubmission/host",
    layout: BaseLayout,
    component: Host,
    roles: "Host",
  },
  {
    path: "/viewstudentreport/studentId/:id",
    layout: BaseLayout,
    component: ViewStudentReport,
    roles: "Admin,Lecturer,Host",
  },
  {
    path: "/presentationscheduling/csmind",
    layout: BaseLayout,
    component: Csmind,
    roles: "Admin",
  },
  {
    path: "/createcsmind",
    layout: BaseLayout,
    component: CreateCsmind,
    roles: "Admin",
  },
  {
    path: "/editcsmind/:id",
    layout: BaseLayout,
    component: EditCsmind,
    roles: "Admin",
  },
  {
    path: "/presentationscheduling/presentation",
    layout: BaseLayout,
    component: Presentation,
    roles: "Admin",
  },
  {
    path: "/createpresentation",
    layout: BaseLayout,
    component: CreatePresentation,
    roles: "Admin",
  },
  {
    path: "/editpresentation/:id",
    layout: BaseLayout,
    component: EditPresentation,
    roles: "Admin",
  },
  {
    path: "/presentationscheduling/constraintsmanagement",
    layout: BaseLayout,
    component: ConstraintsManagement,
    roles: "Admin",
  },
  {
    path: "/createconstraint",
    layout: BaseLayout,
    component: CreateConstraint,
    roles: "Admin",
  },
  {
    path: "/editconstraint/:id",
    layout: BaseLayout,
    component: EditConstraint,
    roles: "Admin",
  },
  {
    path: "/editvenue/:id",
    layout: BaseLayout,
    component: EditVenue,
    roles: "Admin",
  },
  {
    path: "/presentationscheduling/scheduler",
    layout: BaseLayout,
    component: Scheduler,
    roles: "Admin",
  },
  {
    path: "/presentationscheduling/masterschedule",
    layout: BaseLayout,
    component: MasterSchedule,
    roles: "Admin",
  },
  {
    path: "/presentationscheduling/personalizedschedule",
    layout: BaseLayout,
    component: PersonalizedSchedule,
    roles: "Admin",
  },
  {
    path: "/myconstraint",
    layout: BaseLayout,
    component: MyConstraint,
    roles: "Lecturer,Student",
  },
  {
    path: "/editmyconstraint/:id",
    layout: BaseLayout,
    component: EditMyConstraint,
    roles: "Lecturer,Student",
  },
  {
    path: "/createmyconstraint",
    layout: BaseLayout,
    component: CreateMyConstraint,
    roles: "Lecturer,Student",
  },
  {
    path: "/masterschedule",
    layout: BaseLayout,
    component: MasterSchedule,
    roles: "Lecturer,Student",
  },
  {
    path: "/editschedule/:id",
    layout: BaseLayout,
    component: EditMasterSchedule,
    roles: "Admin",
  },
  {
    path: "/personalizedschedule",
    layout: BaseLayout,
    component: PersonalizedSchedule,
    roles: "Lecturer,Student",
  },
  {
    path: "/menteeschedule",
    layout: BaseLayout,
    component: MenteeSchedule,
    roles: "Host",
  },
  {
    path: "/resumerepository",
    layout: BaseLayout,
    component: ResumeRepository,
    roles: "Student",
  },
  {
    path: "/createresume",
    layout: BaseLayout,
    component: CreateResume,
    roles: "Student",
  },

  {
    path: "/editresume/:id",
    layout: BaseLayout,
    component: EditResume,
    roles: "Student",
  },
];

export default routes;
