<div class="badge bg-light-primary">
    <div>{{ Carbon\Carbon::parse($row->created_at)->locale('es')->translatedFormat('d F Y') }}</div>
</div>
