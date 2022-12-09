<script>
    
    export let width = 25;
    export let color = 'green';
    export let textColor = 'white';
    export let text = 'R';
    
    export let type = null;
    
    $: if(type) { 
        switch(type) {
            case 'Component':
                color = 'green';
                textColor = 'white';
                text = 'C';
                break;
            case 'System':
                color = 'blue';
                textColor = 'white';
                text = 'S';
                break;
            case 'Endpoint':
                color = 'Salmon';
                textColor = 'black';
                text = 'A';
                break;
            case "View":
                color = 'yellow';
                textColor = 'black';
                text = 'V';
                break;
            case 'Record':
                color = 'orange';
                textColor = 'black';
                text = 'R';
                break;
            case 'Data':
                color = 'purple';
                textColor = 'white';
                text = 'D';
                break;
            case 'Enum':
                color = 'pink';
                textColor = 'black';
                text = 'E';
                break;
            case 'Flow':
                color = 'brown';
                textColor = 'white';
                text = 'F';
                break;
            default:
                color = 'green';
                textColor = 'white';
                text = 'C';
                break;
        }
    }
    
</script>


<div style="height:{width}px; width:{width}px; display: inline-block;">
<svg viewBox="0 0 {width} {width}">
    <circle cx="{width / 2}" cy="{width / 2}" r="{width / 2}" stroke="black" stroke-width="0" fill="{color}" />
    <text x="50%" y="50%" text-anchor="middle" stroke="{textColor}" class="medium" dy="5px">{text}</text>
</svg>
</div>