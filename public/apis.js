/** @type {import('next').NextConfig} */

// const SERVER = "http://localhost:8080/";
// const SERVER = "https://dsaserver.onrender.com/";
const SERVER = "https://newdsa.dsasilver.com/";

if (!SERVER) {
    throw new Error('Server is not defined');
}

const apis = {
    //USER ADMIN
    userSignUp: `${SERVER}user/signUp`,
    userLogin: `${SERVER}user/loginUser`,
    verifyToken: `${SERVER}user/verifyToken`,
    resetPassword: `${SERVER}user/resetPassword`,
    updateUser: `${SERVER}user/updateUser`,

    //CLIENT
    createClient: `${SERVER}user/createClient`,
    getAllClient: `${SERVER}user/getAllClient`,
    getMembersForGroup: `${SERVER}user/getMembersForGroup`,
    getAllClientCount: `${SERVER}user/getAllClientCount`,
    getClientById: `${SERVER}user/getClientById/`,
    updateClientById: `${SERVER}user/updateClientById/`,
    deleteClientById: `${SERVER}user/deleteClientById/`,
    deleteClients: `${SERVER}user/deleteClients`,
    updateClientProfile: `${SERVER}user/updateClientProfile`,
    updateClientCompanyProfile: `${SERVER}user/updateClientCompanyProfile`,
    importContacts: `${SERVER}clientsImpExp/importClientFromCSV`,
    exportContacts: `${SERVER}clientsImpExp/exportClientToCSV`,

    multiProfilePics: `${SERVER}user/bulkProfilePictureUpload`,
    multiCompanyProfilePics: `${SERVER}user/bulkCompanyProfilePictureUpload`,

    //GROUP
    createGroup: `${SERVER}user/createGroup`,
    updateGroupById: `${SERVER}user/updateGroupById/`,
    addContactsToGroup: `${SERVER}user/addContactsToGroup`,
    deleteGroupById: `${SERVER}user/deleteGroupById/`,
    getGroupById: `${SERVER}user/getGroupById/`,
    getAllGroups: `${SERVER}user/getAllGroups`,
    getAllGroupsName: `${SERVER}user/getAllGroupsName`,

    //TRASH
    getAllDeletedClient: `${SERVER}user/getAllDeletedClient`,
    hardDeleteClients: `${SERVER}user/hardDeleteClients`,
    restoreClients: `${SERVER}user/restoreClients`,
    removeDuplicateLogs: `${SERVER}campaign/removeDuplicateLogs`,
    removeDuplicates: `${SERVER}user/removeDuplicates`,

    //TEMPLATE
    templateImageUpload: `${SERVER}template/templateImageUpload`,
    templateFormatUpload: `${SERVER}template/templateFormatUpload`,
    templateReferenceFormatUpload: `${SERVER}template/templateReferenceFormatUpload`,
    getAllTemplateImages: `${SERVER}template/getAllTemplateImages`,
    getAllTemplateFormat: `${SERVER}template/getAllTemplateFormat`,
    getAllReferenceTemplateFormat: `${SERVER}template/getAllReferenceTemplateFormat`,
    deleteRefTemplate: `${SERVER}template/deleteRefTemplate/`,
    getAllTemplates: `${SERVER}template/getAllTemplates`,
    createTemplate: `${SERVER}template/createTemplate`,
    deleteTemplate: `${SERVER}template/deleteTemplate`,
    testAPI: `${SERVER}template/testAPI`,

    //CAMPAIGN
    createCampaignMarketing: `${SERVER}campaign/createCampaignMarketing`,
    createCampaignUtility: `${SERVER}campaign/createCampaignUtility`,
    duplicateCampaign: `${SERVER}campaign/duplicateCampaign/`,
    createRetargetCampaign: `${SERVER}campaign/createRetargetCampaign`,
    sendMessage: `${SERVER}campaign/sendMessage`,
    getAllCampaigns: `${SERVER}campaign/getAllCampaigns`,
    getCampaignById: `${SERVER}campaign/getCampaignById`,
    getMessagesForCampaign: `${SERVER}campaign/getMessagesForCampaign`,
    deleteCampaign: `${SERVER}campaign/deleteCampaign`,
    campaignAudienceCount: `${SERVER}campaign/campaignAudienceCount`,

    //VARIABLES
    createVariable: `${SERVER}template/createVariable`,
    getAllVariables: `${SERVER}template/getAllVariables`,
    getVariableById: `${SERVER}template/getVariableById/`,
    deleteVariableById: `${SERVER}template/deleteVariableById`,
    updateVariableById: `${SERVER}template/updateVariableById/`,

    //RECEIVED MESSAGES
    receivedMessagesHistory: `${SERVER}chat/receivedMessagesHistory`,
    sendDirectMessage: `${SERVER}chat/sendDirectMessage`,
};

module.exports = apis;
