import { fetchRecentActivities } from "./hooks/firestore.js";
import formatDate from "./hooks/formatDate.js";

export default async function loadRecentActivities() {
  const recentActivities = await fetchRecentActivities();

  //display information
  displayRecentActivities(recentActivities);
}

/* 
FORMAT OF RECENT ACTIVITIES
    <div class="card-entry-header">
        <span><b>03-24-2025</b></span>
    </div>

    <div class="card-entry-list">
    <!-- one item start -->
        <div class="activity-item">
            <img
            class="activity-profile"
            src="duck flowe 2.png"
            alt="user profile"
            />
            <div class="activity-details">
                <span class="primary">4304: AL Care Level Fee 3</span>
                <span>&#160;added by NAME</span>
            </div>
        </div>
    <!-- one item end -->
    </div>
*/
function displayRecentActivities(recentActivities) {
  console.log(recentActivities);
  const recentActivitiesContainer =
    document.getElementById("recent-activities");

  for (const activity of recentActivities) {
    let activityElement = createActivityCard(activity);
    recentActivitiesContainer.appendChild(activityElement);

    if (activity !== recentActivities[recentActivities.length - 1]) {
      const hr = document.createElement("hr");
      hr.classList.add("entry");
      recentActivitiesContainer.appendChild(hr);
    }
  }
}

function createActivityCard(activity) {
  console.log(activity);

  const activityElement = document.createElement("div");
  const activityHeader = document.createElement("div");
  const activityDate = document.createElement("span");
  const activityDateBold = document.createElement("b");
  const activityList = document.createElement("div");

  //add classes
  activityElement.classList.add("activity-entry");
  activityHeader.classList.add("card-entry-header");
  activityList.classList.add("card-entry-list");

  //add text content
  activityDateBold.textContent = formatDate(activity.date);

  //append elements
  activityDate.appendChild(activityDateBold);
  activityHeader.appendChild(activityDate);
  activityElement.appendChild(activityHeader);
  activityElement.appendChild(activityList);

  //add activities
  for (const activityItem of activity.activities) {
    let activityElement = createActivity(activityItem);
    activityList.appendChild(activityElement);
  }

  return activityElement;
}

function createActivity(activity) {
  const activityItem = document.createElement("div");
  const activityProfile = document.createElement("img");
  const activityDetails = document.createElement("div");
  const activityTitle = document.createElement("span");
  const activityAddedBy = document.createElement("span");

  //set classes
  activityItem.classList.add("activity-item");
  activityProfile.classList.add("activity-profile");
  activityDetails.classList.add("activity-details");
  activityTitle.classList.add("primary");

  //set text content

  activityTitle.textContent = activity.title;
  activityAddedBy.textContent = `\u00A0added by ${activity.hostName}`;
  activityProfile.src = activity.hostProfileUrl;

  //append elements
  activityDetails.appendChild(activityTitle);
  activityDetails.appendChild(activityAddedBy);
  activityItem.appendChild(activityProfile);
  activityItem.appendChild(activityDetails);

  return activityItem;
}
