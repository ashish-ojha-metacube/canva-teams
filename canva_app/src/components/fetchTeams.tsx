import React, { useState } from "react"
import styles from "../../styles/components.css";
const fetchTeams = () => {
   const [teams, setTeams] = useState(null);
   const [membersData, setMembersData] = useState(null);
   const [channelList, setChannelList] = useState(null);
   const [channelMessageList, setChannelMessageList] = useState(null);
   const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
   const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
   const [isLoading, setIsLoading] = useState(false);

const config = {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
}
/*
** Here we are fething the List of teams from microsoft teams.
*/
   const teamsList = async () => {
    
        await fetch("http://localhost:3000/teams", config).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const clonedResponse = response.clone();
            return Promise.all([response.json()]);
          })
          .then(([json]) => {
            // Handle the response data
            console.log(json.teams);
            const newData =  json.teams;
            setTeams(newData);
            // console.log(text);
          })
          .catch(error => {
            // Handle any errors
            console.error(error);
          });
   }

   /*
   ** Here we are getting List of members in a team and channels in a team.
   */
   const getTeamDetail = async (teamId: number) => {
    setTeams(null);
    setSelectedTeamId(null);
    setMembersData(null);
    setChannelList(null);
    const [membersResponse, channelResponse] = await Promise.all([
      getTeamMembers(teamId),
      getTeamChannel(teamId),
    ]);
    setIsLoading(false);
      
   }

  /*
  **Here we are getting list of team members for a particular team by passing the team Id.
  */
   const getTeamMembers = async (teamId: number) => {
     console.log('id ======= ' , teamId);
     if (selectedTeamId === teamId) {
      setSelectedTeamId(null);
    } else {
      setSelectedTeamId(teamId);
    }
    await fetch(`http://localhost:3000/members/${teamId}`, config).then(response => {
      console.log('response ------- ' , response);
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return Promise.all([response.json()]);
      })
      .then(([json]) => {
        // Handle the response data
        console.log(json);
        const membersList =  json.members;
        setMembersData(membersList);
      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });
   }

   /*
   ** Here we are getting the channels of a particular team by passing the team Id.
   */
  const getTeamChannel = async (teamId: number) => {
    console.log('id ======= ' , teamId);
    if (selectedTeamId === teamId) {
     setSelectedTeamId(null);
   } else {
     setSelectedTeamId(teamId);
   }
   await fetch(`http://localhost:3000/channels/${teamId}`, config).then(response => {
     console.log('response ------- ' , response);
     
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       return Promise.all([response.json()]);
     })
     .then(([json]) => {
       // Handle the response data
       const channelList =  json.members;
       console.log('channelList ======= ' , channelList);
       setChannelList(channelList);
     })
     .catch(error => {
       // Handle any errors
       console.error(error);
     });
  }

  /*
  ** Here we are getting the channel messages for a particular channel of a team by passing the team Id 
  ** and channel Id.
  */
  const getChannelMessage = async (teamId: number, channelId : number) => {
    console.log('id ======= ' , teamId);
    if (selectedTeamId === teamId && selectedChannelId === channelId) {
     setSelectedTeamId(null);
     setSelectedChannelId(null);
   } else {
     setSelectedTeamId(teamId);
     setSelectedChannelId(channelId);
   }
   await fetch(`http://localhost:3000/messages/${teamId}/${channelId}`, config).then(response => {
     console.log('response ------- ' , response);
     
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       return Promise.all([response.json()]);
     })
     .then(([json]) => {
       // Handle the response data
       const channelMeesage =  json.messages;
       console.log('channelMeesage === ' , channelMeesage);
       setChannelMessageList(channelMeesage);     
     })
     .catch(error => {
       // Handle any errors
       console.error(error);
     });
  }

  const history = async (name : string) =>{
    console.log('back');
  }
   return (
     <div>
       <button onClick={teamsList} className={styles.button}>Fetch API Data</button>
       {teams && (
         <div className={styles.memberList}>
           <h3>Teams</h3>
          <ul>
              {/* {apiData} */}
            {teams.map(team => (
            <li key={team.id} style={{ borderBottom: '1px solid #fff', marginBottom: 10}}>
            
             <div onClick={() => getTeamDetail(team.id)} style={{ cursor: 'pointer' , marginBottom: 10}} >
                {team.displayName}
              </div>
                {isLoading && <p>Loading...</p>}
                {!isLoading && <div>
            
                  {membersData && selectedTeamId === team.id && (
                  <div className={styles.memberList} style={{paddingBottom: 10}}>
                    <h4>Team Members </h4>
                    <ul>
                      {membersData.map((data, index) => (
                        <li key={`${data.userId}-${index+1}`} id={`${data.userId}-${index+1}`}>
                          {data.displayName}
                        </li>
                      ))}
                    </ul>
                  </div>
                  )}


                {channelList  && selectedTeamId === team.id && (
                  <div className={styles.memberList} style={{paddingBottom: 10}}>
                    <h4>Channel List </h4>
                    <ul>
                      {channelList.map((channel)=> (
                        <li key={channel.id} id={channel.id}>
                          <div onClick={() => getChannelMessage(team.id, channel.id)} style={{ cursor: 'pointer' , marginBottom: 10}}>{channel.displayName}</div>

                          {channelMessageList  && selectedChannelId === channel.id && (
                             <div>
                               <h5>Message List</h5>
                               <ul>
                                 {channelMessageList.map(( messages) => (
                                   <li key={messages.id} id={messages.id} style={{marginBottom: 10}}>
                                    <p>{`From: ${messages?.from?.user?.displayName}`}</p>
                                    <span>{messages.body.content}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  )}
                </div>}
            </li>
            ))}
            </ul>
          </div>
       )}       
     </div>
   );
 }
 export default fetchTeams;