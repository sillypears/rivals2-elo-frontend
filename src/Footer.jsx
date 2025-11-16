import { API_BASE_URL, API_BASE_PORT } from "./config";

export default function BottomFooter() {
    return (
        <div className="fixed bottom-0 w-full z-50 bg-black px-4 py-4 gap-4 flex justify-bewteen items-center">
            <a href="https://github.com/sillypears/rivals2-elo-frontend" target="_blank">
                <img width="16px" src="/images/github-mark.png" />
            </a>
            <a href="https://rivals2.com/nolt" title="Nolt Board" target="_blank">
                <img width="16px" src="/images/nolt-mark.jpg" />
            </a>
            <a href="https://dragdown.wiki/wiki/RoA2" title="Dragdown" target="_blank">
                <img width="16px" src="/images/dragdown.png" />
            </a>
            <a href={`http://${API_BASE_URL}:${API_BASE_PORT}/docs`} title="Swagger Docs" target="_blank">
                <img width="16px" src="/images/api.png" />
            </a>
        </div>
    )
}