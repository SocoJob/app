<div class="py-2"> {{ Carbon\Carbon::parse($row->created_at)->locale("es")->translatedFormat('jS M, Y') }}</div>

