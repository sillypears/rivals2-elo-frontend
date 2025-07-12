export default function BottomFooter() {
    return (
        <div className="fixed bottom-0 w-full z-50 bg-black px-4 py-4 gap-4 flex justify-bewteen items-center">
                <a href="https://github.com/sillypears/rivals2-elo-frontend" target="_blank">
                    <img width="16px" src="/images/github-mark.png" />
                </a>
                <a href="https://rivals2.com/nolt" title="Nolt Board" target="_blank">
                    <img width="16px" src="/images/nolt-mark.jpg" />
                </a>
        </div>
    )
}