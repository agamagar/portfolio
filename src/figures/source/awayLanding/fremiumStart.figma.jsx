// EXACT Figma layout export for node 5933:76844 ("Fremium start"), via the
// Figma MCP get_design_context. Reference only — do NOT import this; the live
// figure is src/figures/awayLanding.svg. Asset URLs below were temporary Figma
// CDN links (expire in ~7 days); the files are saved next to this in this folder
// (arrowRight02.svg, lockPassword.svg, image160.png, etc.).

const imgImage160 = "./image160.png";
const imgImage353285 = "./image353285.png";
const imgIPhone15ProBlackTitaniumPortrait = "./iphone15ProBezel.png";
const imgMultiplicationSign = "./multiplicationSign.svg";
const imgArrowRight02 = "./arrowRight02.svg";
const imgVector5803 = "./vector5803.svg";
const imgRectangle1891596871 = "./rectangle871.svg";
const imgRectangle1891596872 = "./rectangle872.svg";
const imgRectangle1891596873 = "./rectangle873.svg";
const imgRectangle1891596874 = "./rectangle874.svg";
const imgVector5805 = "./vector5805.svg";
const imgVector5806 = "./vector5806.svg";
const imgRouteBlock = "./routeBlock.svg";
const imgGroup2147228145 = "./group145.svg";
const imgGroup2147228146 = "./group146.svg";
const imgTicketStar = "./ticketStar.svg";
const imgLockPassword = "./lockPassword.svg";

export default function FremiumStart() {
  return (
    <div className="bg-[#0b0b14] content-stretch flex flex-col items-center overflow-clip relative rounded-[56px] size-full" data-node-id="5933:76844" data-name="Fremium start">
      <div className="absolute h-[879px] left-[-23px] top-[-35px] w-[406px]" data-node-id="5933:76845" data-name="Halftone Dots Effect" />
      <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px py-[64px] relative w-full" data-node-id="5937:166534">
        <div className="content-stretch flex flex-col font-['Stack_Sans_Headline:Light'] gap-[6px] items-center text-[24px] text-center tracking-[0.408px] w-[268px]" data-node-id="5933:76907">
          <p data-node-id="5933:76908" style={{ backgroundImage: "linear-gradient(93deg, #705ADE 11.658%, #B2A2FF 89.149%)", color: "transparent", backgroundClip: "text" }}>
            Hey Sukesh
          </p>
          <p style={{ color: "#e2e8f0" }} data-node-id="5933:76909">Where are you going?</p>
        </div>
      </div>
      {/* search + upload card */}
      <div className="flex flex-col gap-[16px] items-center justify-center p-[16px] w-full" data-node-id="5933:76919">
        {/* search field: outer gradient border rounded 16, inner #13131f rounded 14 */}
        <a className="flex flex-col p-[2px] rounded-[16px] w-full" data-node-id="5937:166537" data-name="search (gradient border)">
          <div className="bg-[#13131f] flex flex-col gap-[36px] p-[12px] rounded-[14px] w-full" data-node-id="5937:166538">
            <div className="flex gap-[12px] items-center px-[6px] py-[4px] w-full" data-node-id="5937:166539">
              <p className="font-['Google_Sans_Flex:Light'] text-[14px] leading-[18px]" style={{ color: "#64748b" }} data-node-id="5937:166541">Search for a city, flight type or fare</p>
            </div>
            <div className="flex items-center justify-between w-full" data-node-id="5937:166542">
              <div className="bg-[#1c222f] flex items-center justify-center opacity-0 p-[8px] rounded-[100px] size-[36px]" data-node-id="5937:166543" data-name="clear (hidden)">
                <img alt="" className="size-[16px]" src={imgMultiplicationSign} data-node-id="5937:166544" />
              </div>
              <div className="bg-[#e2e8f0] flex h-[36px] items-center justify-center p-[16px] rounded-[1000px] w-[48px]" data-node-id="5937:166556" data-name="send">
                <div className="-rotate-90 size-[16px]"><img alt="" className="size-[16px]" src={imgArrowRight02} data-node-id="5937:166557" /></div>
              </div>
            </div>
          </div>
        </a>
        {/* upload card: border #1c222f rounded 20, h124 */}
        <div className="border border-[#1c222f] flex h-[124px] items-start justify-center overflow-clip rounded-[20px] w-full" data-node-id="5933:76937">
          <div className="bg-[#0b0b14] blur-[2px] flex h-[124px] items-center justify-between overflow-clip p-[5.231px] w-[122px]" data-node-id="5933:76938" data-name="phone mockup (raster)">
            {/* iPhone 15 Pro bezel + screen (image160) + in-screen fare card vectors; see assets */}
            <img alt="" src={imgIPhone15ProBlackTitaniumPortrait} data-node-id="I5933:76954;203:13993" />
            <img alt="" src={imgImage160} data-node-id="5933:76941" />
          </div>
          {/* floating white fare card */}
          <img alt="" className="absolute h-[33.879px] w-[78.512px] rounded-[3.764px]" src={imgImage353285} data-node-id="5933:76955" data-name="fare card (raster)" />
          <div className="flex flex-[1_0_0] flex-col gap-[12px] h-full items-start justify-center pb-[16px] pt-[12px] px-[20px]" data-node-id="5933:76956">
            <p className="font-['Google_Sans_Flex:Light'] text-[14px] leading-[20px]" style={{ color: "#e2e8f0" }} data-node-id="5933:76958">
              Have a flight in mind?<br aria-hidden />We’ll find a better price
            </p>
            <div className="bg-[#1c222f] flex items-center justify-center px-[12px] py-[8px] rounded-[100px]" data-node-id="5933:76959">
              <p className="font-['Google_Sans_Flex:Regular'] text-[12px]" style={{ color: "#e2e8f0" }} data-node-id="5933:76960">Upload screenshot</p>
            </div>
          </div>
        </div>
      </div>
      {/* footer: invite-only cluster */}
      <div className="flex flex-[1_0_0] flex-col gap-[16px] items-center justify-end min-h-px py-[32px] w-full" data-node-id="5937:166782">
        <div className="flex flex-col gap-[16px] items-center justify-center w-full" data-node-id="5937:167055">
          <div className="inline-grid place-items-start" data-node-id="5937:167056" data-name="icon chips (overlapping)">
            <div className="col-1 row-1 flex items-center justify-center p-[9.333px] rounded-[38.889px] size-[28px]" data-node-id="5937:167057" style={{ backgroundImage: "radial-gradient(rgba(145,80,31,0.3), rgba(145,69,31,0))" }} data-name="route-block (orange)">
              <img alt="" className="size-[9.333px]" src={imgRouteBlock} data-node-id="5937:167059" />
            </div>
            <div className="col-1 row-1 ml-[10px] flex items-center justify-center p-[9.333px] rounded-[38.889px] size-[28px]" data-node-id="5937:167069" style={{ backgroundImage: "radial-gradient(rgba(80,31,145,0.2), rgba(80,31,145,0))" }} data-name="purple chip">
              <div className="opacity-0 flex"><img alt="" src={imgGroup2147228145} /><img alt="" src={imgGroup2147228146} /></div>
            </div>
            <div className="col-1 row-1 ml-[5px] flex items-center justify-center p-[9.333px] rounded-[38.889px] size-[28px] shadow-[inset_0px_0px_0.707px_0px_rgba(31,145,58,0.7)]" data-node-id="5937:167092" style={{ backgroundImage: "radial-gradient(rgba(31,145,101,0), rgba(31,145,101,0.3))" }} data-name="ticket-star (green)">
              <img alt="" className="opacity-0 size-[9.333px]" src={imgTicketStar} data-node-id="5937:167095" />
            </div>
            <div className="col-1 row-1 ml-[12.78px] mt-[8px] flex flex-col size-[12px]" data-node-id="5937:167099" data-name="lock">
              <img alt="" className="size-[12px]" src={imgLockPassword} data-node-id="5937:167100" />
            </div>
          </div>
          <div className="flex flex-col gap-[6px] items-center text-[14px]" data-node-id="5937:167111">
            <p className="font-['Google_Sans_Flex:Light'] text-center" style={{ color: "#64748b" }} data-node-id="5937:167107">Away is invite only, you have limited access</p>
            <p className="font-['Google_Sans_Flex:Regular']" style={{ color: "#e2e8f0" }} data-node-id="5937:167109">Got an invite code?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
