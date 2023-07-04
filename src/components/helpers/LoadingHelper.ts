
export class LoadingHelper {
    static displayOn() {
        document
            .querySelector('.loadingContainer')
            ?.classList.remove('display-none');
    }

    static displayOff() {
        setTimeout(() => {
            document
                .querySelector('.loadingContainer')
                ?.classList.add('display-none');
        }, 500);
    }
}